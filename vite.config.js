import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import fs from "node:fs";
import { filmer as grunddata } from "./src/mockFilmer.js";

function medAffisch(film) {
  for (const andelse of ["jpg", "jpeg", "png", "webp"]) {
    if (fs.existsSync(`public/affischer/${film.bild}.${andelse}`)) {
      return { ...film, imageUrl: `/affischer/${film.bild}.${andelse}` };
    }
  }
  return film;
}

const mockApi = {
  name: "mock-api",
  configureServer(server) {
    server.middlewares.use("/api/movies", (req, res) => {
      const id = Number(req.url.replace("/", ""));
      res.setHeader("Content-Type", "application/json");
      if (!req.url || req.url === "/") return res.end(JSON.stringify(grunddata.map(medAffisch)));
      const film = grunddata.map(medAffisch).find((f) => f.id === id);
      if (!film) { res.statusCode = 404; return res.end(JSON.stringify({ error: "Filmen hittades inte" })); }
      res.end(JSON.stringify({ ...film, actors: film.actors.split(",").map((n) => n.trim()) }));
    });
  },
};

export default defineConfig({ plugins: [react(), tailwindcss(), mockApi] });
