import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import MovieDetails from "./pages/MovieDetails";

function Home() {
  return (
    <div className="p-8 text-white">
      <h1 className="text-2xl font-bold mb-4">Startsida - Filmer</h1>
      <p className="text-zinc-400 mb-4">Klicka för att testa detaljsidan:</p>
      <div className="flex gap-4">
        <Link to="/movies/1" className="bg-blue-600 px-4 py-2 rounded">
          Visa Film 1
        </Link>
        <Link to="/movies/2" className="bg-blue-600 px-4 py-2 rounded">
          Visa Film 2
        </Link>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <main className="min-h-screen bg-zinc-950">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/movies/:id" element={<MovieDetails />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
