import express from "express";
import db from "./db.js";

const app = express();
const PORT = 3000;

app.use(express.json());

app.get("/api", (req, res) => {
  res.json({ message: "Filmvisarna API fungerar!" });
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
