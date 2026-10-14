import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Screenings from "./pages/Screenings";

function Home() {
  return (
    <div className="p-8 text-white">
      <h1 className="text-2xl font-bold mb-4">Filmvisarna</h1>
      <Link
        to="/screenings"
        className="inline-block bg-blue-600 px-4 py-2 rounded hover:bg-blue-500 transition"
      >
        Visa filmvisningar
      </Link>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <main className="min-h-screen bg-zinc-950">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/screenings" element={<Screenings />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
