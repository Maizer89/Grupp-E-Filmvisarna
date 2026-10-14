import express from "express";
import db from "./db.js";
import { randomUUID } from "node:crypto";

const app = express();
const PORT = 3000;

app.use(express.json());

app.get("/api/screenings/:id/seats", async (req, res) => {
  const screeningId = req.params.id;

  try {
    const [screenings] = await db.query(
      "SELECT id FROM screenings WHERE id = ?",
      [screeningId],
    );

    if (screenings.length === 0) {
      return res.status(404).json({ error: "Visning kunde inte hittas" });
    }

    const [seats] = await db.query(
      `SELECT seats.*
      FROM seats
      JOIN screenings
      ON seats.auditorium_id = screenings.auditorium_id
      WHERE screenings.id = ?
      ORDER BY seats.row_number, seats.seat_number`,
      [screeningId],
    );

    const [occupiedSeats] = await db.query(
      `SELECT tickets.seat_id
      FROM tickets
      JOIN bookings ON tickets.booking_id = bookings.id
      WHERE bookings.screening_id = ?
        AND (
          bookings.status = 'confirmed'
          OR (
            bookings.status = 'pending'
            AND bookings.reserved_until > NOW()
          )
        )`,
      [screeningId],
    );

    const occupiedSeatIds = new Set(occupiedSeats.map((seat) => seat.seat_id));

    const seatsWithAvailability = seats.map((seat) => ({
      ...seat,
      isAvailable: !occupiedSeatIds.has(seat.id),
    }));

    res.json(seatsWithAvailability);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Kunde inte hämta stolar" });
  }
});

app.post("/api/bookings", async (req, res) => {
  const { screeningId, seats, customerEmail } = req.body;

  if (
    !Number.isInteger(screeningId) ||
    screeningId <= 0 ||
    !Array.isArray(seats) ||
    seats.length === 0 ||
    typeof customerEmail !== "string" ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)
  ) {
    return res.status(400).json({
      error: "Ogiltiga bokningsuppgifter",
    });
  }

  const invalidSeats = seats.some((seat) => {
    return (
      !seat ||
      !Number.isInteger(seat.seatId) ||
      seat.seatId <= 0 ||
      !Number.isInteger(seat.ticketTypeId) ||
      seat.ticketTypeId <= 0
    );
  });

  if (invalidSeats) {
    return res.status(400).json({
      error: "Ogiltiga stolar eller biljettyper",
    });
  }

  const seatIds = seats.map((seat) => seat.seatId);

  if (new Set(seatIds).size !== seatIds.length) {
    return res.status(400).json({
      error: "Samma stol kan inte bokas flera gånger",
    });
  }

  let connection;

  try {
    connection = await db.getConnection(); // Gets a connection from the MySQL connection pool

    await connection.query("SET TRANSACTION ISOLATION LEVEL READ COMMITTED");

    await connection.beginTransaction(); // Starts a transaction
    const [screenings] = await connection.query(
      "SELECT id, auditorium_id FROM screenings WHERE id = ?",
      [screeningId],
    );

    if (screenings.length === 0) {
      await connection.rollback();

      return res.status(404).json({
        error: "Visningen hittades inte",
      });
    }

    const [validSeats] = await connection.query(
      "SELECT id FROM seats WHERE auditorium_id = ? AND id IN (?)",
      [screenings[0].auditorium_id, seatIds],
    );

    if (validSeats.length !== seatIds.length) {
      await connection.rollback();

      return res.status(400).json({
        error: "En eller flera stolar tillhör inte visningens salong",
      });
    }

    const ticketTypeIds = [...new Set(seats.map((seat) => seat.ticketTypeId))];

    const [validTicketTypes] = await connection.query(
      "SELECT id FROM ticket_types WHERE id IN (?)",
      [ticketTypeIds],
    );

    if (validTicketTypes.length !== ticketTypeIds.length) {
      await connection.rollback();

      return res.status(400).json({
        error: "En eller flera biljettyper är ogiltiga",
      });
    }
    // Lock selected seats during the transaction to prevent double bookings
    const sortedSeatIds = [...seatIds].sort((a, b) => a - b);
    const placeholders = sortedSeatIds.map(() => "?").join(",");

    await connection.query(
      `SELECT id
      FROM seats
      WHERE id IN (${placeholders})
      ORDER BY id
      FOR UPDATE`,
      sortedSeatIds,
    );

    const [occupiedSeats] = await connection.query(
      `SELECT tickets.seat_id
      FROM tickets
      JOIN bookings ON tickets.booking_id = bookings.id
      WHERE bookings.screening_id = ?
      AND tickets.seat_id IN (${placeholders})
      AND (
        bookings.status = 'confirmed'
        OR (
          bookings.status = 'pending'
          AND bookings.reserved_until > NOW()
        )
      )`,
      [screeningId, ...sortedSeatIds],
    );

    if (occupiedSeats.length > 0) {
      await connection.rollback();

      return res.status(409).json({
        error: "En eller flera valda stolar är redan bokade eller reserverade",
      });
    }

    const bookingId = randomUUID();
    const reservationMinutes = 10;

    await connection.query(
      `INSERT INTO bookings (
        id,
        screening_id,
        customer_email,
        status,
        reserved_until
      )
      VALUES (?, ?, ?, 'pending', DATE_ADD(NOW(), INTERVAL ? MINUTE))`,
      [bookingId, screeningId, customerEmail, reservationMinutes],
    );

    for (const seat of seats) {
      await connection.query(
        `INSERT INTO tickets (booking_id, seat_id, ticket_type_id)
        VALUES (?, ?, ?)`,
        [bookingId, seat.seatId, seat.ticketTypeId],
      );
    }

    await connection.commit();

    return res.status(201).json({
      message: "Bokningen har skapats",
      bookingId,
    });
  } catch (error) {
    if (connection) {
      await connection.rollback(); // Reverts database changes if something goes wrong
    }

    console.error(error);

    res.status(500).json({
      error: "Kunde inte skapa bokningen",
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

app.patch("/api/bookings/:id/confirm", async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.query(
      `UPDATE bookings
   SET status = 'confirmed',
       reserved_until = NULL
   WHERE id = ?
     AND status = 'pending'
     AND reserved_until > NOW()`,
      [id],
    );

    if (result.affectedRows === 0) {
      return res.status(409).json({
        error:
          "Bokningen kan inte bekräftas eller reservationstiden har gått ut",
      });
    }

    return res.status(200).json({
      message: "Bokningen har bekräftats",
      bookingId: id,
    });
  } catch (error) {
    console.error("Error confirming booking", error);

    return res.status(500).json({
      error: "Kunde inte bekräfta bokningen",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
