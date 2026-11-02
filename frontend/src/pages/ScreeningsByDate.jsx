import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

// User story 11: filtrera visningar på datum.
// Hämtar alla visningar från /api/screenings och filtrerar på valt datum i webbläsaren.
const API = "/api";
const TIDSZON = "Europe/Stockholm";

const knownPosters = [
  { match: /spirited away/i, file: "poster-spirited-away.webp" },
  { match: /mononoke/i, file: "poster-mononoke.webp" },
  { match: /levande slott|howl/i, file: "poster-howls-castle.webp" },
  { match: /totoro/i, file: "poster-totoro.webp" },
  { match: /metropolis/i, file: "poster-metropolis.webp" },
  { match: /innocence/i, file: "poster-innocence.webp" },
  { match: /akira/i, file: "poster-akira.webp" },
  { match: /your name/i, file: "poster-your-name.webp" },
];

function affischFor(titel, posterUrl) {
  const kand = knownPosters.find((p) => p.match.test(String(titel || "")));
  if (kand) return `/home/${kand.file}`;
  const bild = String(posterUrl || "");
  const platshallare = /placeholder|placehold|dummyimage|picsum|300\s*[x/]\s*450|\/300\/450/i.test(bild);
  return bild && !platshallare ? bild : null;
}

function Affisch({ src, titel }) {
  const [felSrc, setFelSrc] = useState(null);
  const klass = "h-28 w-20 shrink-0 overflow-hidden rounded border border-[#FF8A3D] bg-[#202026] object-cover";

  if (!src || felSrc === src) {
    return (
      <div
        role="img"
        aria-label={`Affisch saknas för ${titel}`}
        className={`${klass} flex items-center justify-center p-1 text-center text-[10px] text-[#EEE7D6]/80`}
      >
        {titel}
      </div>
    );
  }
  return <img src={src} alt={`Affisch för ${titel}`} onError={() => setFelSrc(src)} className={klass} />;
}

// "2026-10-30" i svensk tid
const datumISvenskTid = (value) =>
  new Date(value).toLocaleDateString("sv-SE", { timeZone: TIDSZON });

const klockslag = (value) =>
  new Date(value).toLocaleTimeString("sv-SE", {
    timeZone: TIDSZON,
    hour: "2-digit",
    minute: "2-digit",
  });

export default function ScreeningsByDate() {
  const navigate = useNavigate();
  const { date } = useParams();
  const idag = new Date().toLocaleDateString("sv-SE");
  // Datumet står i adressen: /screenings/date/2026-10-30. Saknas eller är det ogiltigt används idag.
  const datum = /^\d{4}-\d{2}-\d{2}$/.test(date || "") ? date : idag;
  const setDatum = (iso) => navigate(`/screenings/date/${iso}`);
  const [screenings, setScreenings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    async function hamtaVisningar() {
      try {
        const res = await fetch(`${API}/screenings`, { signal: controller.signal });
        if (!res.ok) throw new Error("Kunde inte hämta visningarna");
        const data = await res.json();
        setScreenings(Array.isArray(data) ? data : []);
      } catch (err) {
        if (err.name !== "AbortError") setError(err.message);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    hamtaVisningar();
    return () => controller.abort();
  }, []);

  const nu = new Date();
  const kommande = screenings.filter((s) => new Date(s.start_time) > nu);

  // De kommande sju dagarna som snabbval
  const dagar = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });

  const harVisning = (dag) => {
    const iso = dag.toLocaleDateString("sv-SE");
    return kommande.some((s) => datumISvenskTid(s.start_time) === iso);
  };

  // Valda dagens visningar
  const valda = kommande
    .filter((s) => datumISvenskTid(s.start_time) === datum)
    .sort((a, b) => new Date(a.start_time) - new Date(b.start_time));

  const filmer = [];
  for (const s of valda) {
    let film = filmer.find((f) => f.movie_id === s.movie_id);
    if (!film) {
      film = { ...s, tider: [] };
      filmer.push(film);
    }
    film.tider.push(s);
  }

  const valtDatumText = new Date(`${datum}T12:00:00`).toLocaleDateString("sv-SE", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).replace(/^./, (c) => c.toUpperCase());

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 text-[#EEE7D6] sm:px-6">
      <h1 className="font-['Roboto_Serif'] text-3xl text-white sm:text-4xl">Visningar</h1>
      <p className="mb-5 text-sm text-[#EEE7D6]/80">
        Välj ett datum för att se vilka filmer som går den dagen
      </p>

      <div className="mb-6 flex flex-col gap-4 rounded-lg border border-[#FF8A3D]/60 bg-[#070706]/90 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <label htmlFor="visning-datum" className="text-sm font-medium">
            Välj datum
          </label>
          <input
            id="visning-datum"
            type="date"
            value={datum}
            min={idag}
            onChange={(e) => e.target.value && setDatum(e.target.value)}
            className="rounded border border-[#C8A96B] bg-[#171717] px-3 py-2 text-[#EEE7D6] outline-none focus:border-[#FF8A3D]"
          />
        </div>

        {/* Snabbval: sju dagar framåt. Mobil: scrolla i sidled */}
        <div className="flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Snabbval för datum">
          {dagar.map((dag, i) => {
            const iso = dag.toLocaleDateString("sv-SE");
            const vald = iso === datum;
            return (
              <button
                key={iso}
                type="button"
                onClick={() => setDatum(iso)}
                aria-pressed={vald}
                className={`shrink-0 rounded-md border px-3 py-2 text-center text-xs transition-colors ${vald
                  ? "border-[#FF8A3D] bg-[#FF8A3D] text-[#070706]"
                  : "border-[#FF8A3D]/60 hover:bg-[#202026]"
                  }`}
              >
                <span className="block font-semibold">
                  {i === 0
                    ? "Idag"
                    : dag.toLocaleDateString("sv-SE", { weekday: "short" }).replace(/^./, (c) => c.toUpperCase())}
                </span>
                <span className="block">
                  {dag.toLocaleDateString("sv-SE", { day: "numeric", month: "short" })}
                </span>
                <span aria-hidden="true" className={`mx-auto mt-1 block h-1.5 w-1.5 rounded-full ${harVisning(dag) ? (vald ? "bg-[#070706]" : "bg-[#FF8A3D]") : "bg-transparent"}`} />
              </button>
            );
          })}
        </div>
      </div>

      <h2 className="mb-4 font-['Roboto_Serif'] text-xl text-white sm:text-2xl">
        {valtDatumText}
      </h2>

      {loading && <p>Hämtar visningar...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && filmer.length === 0 && (
        <p className="rounded-lg border border-[#C8A96B]/40 bg-[#090808]/90 p-5 text-sm">
          Inga visningar det här datumet. Prova en annan dag.
        </p>
      )}

      <ul className="grid gap-4 md:grid-cols-2">
        {filmer.map((film) => (
          <li
            key={film.movie_id}
            className="flex gap-4 rounded-lg border border-[#B9652F]/70 bg-[#070706]/95 p-3"
          >
            <Link to={`/movies/${film.movie_id}`} aria-label={`Visa ${film.movie_title}`}>
              <Affisch src={affischFor(film.movie_title, film.poster_url)} titel={film.movie_title} />
            </Link>

            <div className="min-w-0 flex-1">
              <h3 className="font-['Roboto_Serif'] text-lg font-semibold text-white">
                <Link to={`/movies/${film.movie_id}`} className="hover:text-[#FF9E5C]">
                  {film.movie_title}
                </Link>
              </h3>
              <p className="mb-2 text-xs text-[#EEE7D6]/70">
                {film.duration} min | Från {film.age_limit} år
              </p>

              <div className="flex flex-wrap gap-2">
                {film.tider.map((s, i) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => navigate(`/screenings/${s.id}/seats`)}
                    className="rounded-md border px-3 py-1 text-left text-sm transition-colors hover:bg-[#202026]"
                    style={{ borderColor: i % 2 ? "#FF6685" : "#C8A96B", color: i % 2 ? "#FF6685" : "#C8A96B" }}
                  >
                    <span className="block text-base font-bold leading-tight">{klockslag(s.start_time)}</span>
                    <span className="block text-[10px] leading-tight text-[#EEE7D6]">{s.auditorium_name}</span>
                  </button>
                ))}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
