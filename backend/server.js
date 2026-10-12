import express from "express";
import db from "./db.js";

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

    res.json(seats);
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
    connection = await db.getConnection(); //Lånar anslutning från MySQL pool
    await connection.beginTransaction(); //Påbörjar en transaktion
    const [screenings] = await connection.query(
      "SELECT id, auditorium_id FROM screenings WHERE id = ?",
      [screeningId],
    );

    if (screenings.length === 0) {
      return res.status(404).json({
        error: "Visningen hittades inte",
      });
    }

    const [validSeats] = await connection.query(
      "SELECT id FROM seats WHERE auditorium_id = ? AND id IN (?)",
      [screenings[0].auditorium_id, seatIds],
    );

    if (validSeats.length !== seatIds.length) {
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
      return res.status(400).json({
        error: "En eller flera biljettyper är ogiltiga",
      });
    }

    await connection.rollback(); //Ångrar databasändringar om något går fel

    res.status(501).json({
      message: "Visning hittad. Bokningen är ännu inte implementerad",
    });
  } catch (error) {
    if (connection) {
      await connection.rollback(); //Ångrar databasändringar om något går fel
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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
