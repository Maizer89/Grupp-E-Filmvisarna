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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
