import express from "express";
import db from "./db.js";
import { randomUUID } from "node:crypto";
import { createServer } from "node:http";
import { Server } from "socket.io";
import { expirePendingBookings } from "./jobs/expireBookings.js";
import kontoRouter from "./routes/konto.js";
import session from "express-session";
import minaBokningarRouter from "./routes/minaBokningar.js";
import { sendBookingConfirmation } from "./services/emailService.js";

const app = express();
const PORT = 3000;

const httpServer = createServer(app);
export const io = new Server(httpServer);

// US-14: Hantera realtidsanslutningar via Socket.io
io.on("connection", (socket) => {
  console.log("🔌 Ny Socket.io-klient ansluten:", socket.id);

  socket.on("join_screening", (screeningId) => {
    const room = `screening_${screeningId}`;
    socket.join(room);
    console.log(`📡 Klient ${socket.id} anslöt till rum ${room}`);
  });

  socket.on("leave_screening", (screeningId) => {
    const room = `screening_${screeningId}`;
    socket.leave(room);
    console.log(`📡 Klient ${socket.id} lämnade rum ${room}`);
  });

  socket.on("disconnect", () => {
    console.log("🔌 Socket.io-klient kopplade från:", socket.id);
  });
});

app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
    },
  }),
);

app.use("/api", kontoRouter);

app.use("/api", minaBokningarRouter);

// US-10: Hämta biljettyper och priser
app.get("/api/ticket-types", async (req, res) => {
  try {
    const [ticketTypes] = await db.query(
      "SELECT id, name, price FROM ticket_types ORDER BY id",
    );

    return res.status(200).json(ticketTypes);
  } catch (error) {
    console.error("Fel vid hämtning av biljettpriser:", error);

    return res.status(500).json({
      error: "Kunde inte hämta biljettpriser",
    });
  }
});

app.get("/api/movies", async (req, res) => {
  try {
    const [movies] = await db.query("SELECT * FROM movies");

    return res.status(200).json(movies);
  } catch (error) {
    console.error("Error fetching movies:", error);

    return res.status(500).json({
      error: "Kunde inte hämta filmerna",
    });
  }
});

// US-4: Hämta en specifik film
app.get("/api/movies/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query("SELECT * FROM movies WHERE id = ?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Filmen hittades inte" });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error("Fel vid hämtning av film:", err);
    res.status(500).json({ error: "Kunde inte hämta filmen" });
  }
});

// US-11: Hämta visningar (filtrerat på datum via query-parameter ?date=YYYY-MM-DD)
app.get("/api/screenings", async (req, res) => {
  const { date } = req.query;

  try {
    let query = `
      SELECT 
        s.id,
        s.start_time,
        m.id AS movie_id,
        m.title AS movie_title,
        m.poster_url,
        m.duration,
        m.age_limit,
        a.name AS auditorium_name
      FROM screenings s
      JOIN movies m ON s.movie_id = m.id
      JOIN auditoriums a ON s.auditorium_id = a.id
    `;

    const params = [];

    if (date) {
      query += " WHERE DATE(s.start_time) = ?";
      params.push(date);
    }

    query += " ORDER BY s.start_time ASC";

    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error("Fel vid hämtning av visningar:", err);
    res.status(500).json({ error: "Kunde inte hämta visningar" });
  }
});

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

    // US-10: Hämta biljettyper och priser från databasen
    const [validTicketTypes] = await connection.query(
      "SELECT id, price FROM ticket_types WHERE id IN (?)",
      [ticketTypeIds],
    );

    if (validTicketTypes.length !== ticketTypeIds.length) {
      await connection.rollback();

      return res.status(400).json({
        error: "En eller flera biljettyper är ogiltiga",
      });
    }

    // US-10: Beräkna totalpriset utifrån valda biljettyper
    const ticketPrices = new Map(
      validTicketTypes.map((ticketType) => [ticketType.id, ticketType.price]),
    );

    const totalPrice = seats.reduce((total, seat) => {
      return total + ticketPrices.get(seat.ticketTypeId);
    }, 0);

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

    // US-14: Skicka ut uppdaterad stolstatus till alla som tittar på samma visning i realtid
    io.to(`screening_${screeningId}`).emit("seat_status_changed", {
      screeningId: Number(screeningId),
      seatIds,
      isAvailable: false,
      status: "pending",
    });

    return res.status(201).json({
      message: "Bokningen har skapats",
      bookingId,
      totalPrice,
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

    // US-8: Skicka bokningsbekräftelse via e-post
    try {
      const [bookingInfo] = await db.query(
        `SELECT b.customer_email, m.title AS movie, s.start_time AS startTime, a.name AS auditorium
         FROM bookings b
         JOIN screenings s ON b.screening_id = s.id
         JOIN movies m ON s.movie_id = m.id
         JOIN auditoriums a ON s.auditorium_id = a.id
         WHERE b.id = ?`,
        [id],
      );

      if (bookingInfo.length > 0) {
        const [seats] = await db.query(
          `SELECT s.row_number AS rowNumber, s.seat_number AS seatNumber
           FROM tickets t
           JOIN seats s ON t.seat_id = s.id
           WHERE t.booking_id = ?
           ORDER BY s.row_number, s.seat_number`,
          [id],
        );

        sendBookingConfirmation({
          to: bookingInfo[0].customer_email,
          bookingNumber: id,
          movieTitle: bookingInfo[0].movie,
          screeningTime: bookingInfo[0].startTime,
          auditoriumName: bookingInfo[0].auditorium,
          seats,
        }).catch((emailErr) => {
          console.error(
            "Fel vid asynkront skickande av bekräftelsemail:",
            emailErr,
          );
        });
      }
    } catch (emailQueryErr) {
      console.error(
        "Kunde inte hämta bokningsdetaljer för e-postutskick:",
        emailQueryErr,
      );
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

// US-7: Hämta bokningsbekräftelse
app.get("/api/bookings/:id/confirmation", async (req, res) => {
  const { id } = req.params;

  try {
    const [bookings] = await db.query(
      `SELECT
        b.id AS bookingNumber,
        b.status,
        m.title AS movie,
        s.start_time AS startTime
      FROM bookings b
      JOIN screenings s ON b.screening_id = s.id
      JOIN movies m ON s.movie_id = m.id
      WHERE b.id = ? AND b.status = 'confirmed'`,
      [id],
    );

    if (bookings.length === 0) {
      return res.status(404).json({
        error: "Ingen bekräftad bokning hittades",
      });
    }

    // US-7: Hämta rad- och stolsnummer för bokningen
    const [seats] = await db.query(
      `SELECT
        s.row_number AS rowNumber,
        s.seat_number AS seatNumber
      FROM tickets t
      JOIN seats s ON t.seat_id = s.id
      WHERE t.booking_id = ?
      ORDER BY s.row_number, s.seat_number`,
      [id],
    );

    return res.status(200).json({
      bookingNumber: bookings[0].bookingNumber,
      movie: bookings[0].movie,
      startTime: bookings[0].startTime,
      seats: seats,
      status: bookings[0].status,
    });
  } catch (error) {
    console.error("Fel vid hämtning av bokningsbekräftelse:", error);

    return res.status(500).json({
      error: "Kunde inte hämta bokningsbekräftelsen",
    });
  }
});

// Check for expired bookings every minute
setInterval(expirePendingBookings, 60 * 1000);

httpServer.listen(PORT, () => {
  console.log(`Servern körs på http://localhost:${PORT}`);
});
