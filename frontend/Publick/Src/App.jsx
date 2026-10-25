import { useEffect, useState } from "react";
import Sidlayout, { Rutnat } from "./Sidlayout.jsx";
import FilmDetalj from "./FilmDetalj.jsx";

export default function App() {
  const [filmer, setFilmer] = useState([]);
  const [valdFilm, setValdFilm] = useState(null);

  useEffect(() => {
    fetch("/api/movies").then((r) => r.json()).then(setFilmer);
  }, []);

  return (
    <Sidlayout>
      {valdFilm ? (
        <FilmDetalj filmId={valdFilm} onTillbaka={() => setValdFilm(null)} />
      ) : (
        <Rutnat>
          {filmer.map((f) => (
            <button key={f.id} onClick={() => setValdFilm(f.id)}
              className="overflow-hidden rounded-xl bg-black/75 text-left text-white hover:ring-2 hover:ring-orange-400">
              <img src={f.imageUrl} alt={f.title} className="aspect-[2/3] w-full object-cover" />
              <p className="p-3 font-semibold">{f.title}</p>
            </button>
          ))}
        </Rutnat>
      )}
    </Sidlayout>
  );
}
