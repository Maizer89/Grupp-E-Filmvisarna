import express from "express";
import cors from "cors";
import db from "./db.js";

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

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

app.listen(PORT, () => {
  console.log(`Servern körs på http://localhost:${PORT}`);
});
