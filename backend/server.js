import "dotenv/config";
import express from "express";
import db from "./db.js";

const app = express();
const PORT = 3000;

app.use(express.json());

app.get("/api", (req, res) => {
  res.json({ message: "Filmvisarna API fungerar!" });
});

// Hämtar alla filmer från databasen
app.get("/api/movies", async (req, res) => {
  try {
    const [movies] = await db.query("SELECT * FROM movies");
    res.json(movies);
  } catch (error) {
    console.error("Fel vid hämtning av filmer:", error);
    res.status(500).json({ error: "Kunde inte hämta filmer" });
  }
});
// Hämtar en specifik film via ID
app.get("/api/movies/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query("SELECT * FROM movies WHERE id = ?", [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Filmen hittades inte" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("Fel vid hämtning av film:", error);
    res.status(500).json({ error: "Kunde inte hämta filmen" });
  }
});

try {
  await db.query("SELECT 1");
  console.log("Connected to MySQL!");
} catch (error) {
  console.error("Could not connect to MySQL:", error);
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
