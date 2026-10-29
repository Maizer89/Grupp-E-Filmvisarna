import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

// User story 4 (filmdetalj) och 22 (responsiv).
// Route: /movies/:id  (länkas från Screenings med screening.movie_id)

const API = "/api";

const TEXTER = {
  laddar: "Hämtar film...",
  fel: "Kunde inte hämta filmen",
  tillbaka: "Tillbaka till Filmer",
  regissor: "Regissör",
  skadespelare: "Skådespelare",
  trailer: "Trailer",
  visningar: "Visningstider",
  visningarInfo: "Välj dag och tid för att boka dina biljetter",
  gillar: "Du kanske också gillar",
  regi: "Regi",
  roller: "Roller",
  franAlder: "Från",
  trailerYoutube: "Öppna trailern på YouTube",
  min: "min",
  ar: "år",
};

// Affischer och genrer. Samma bilder och samma titelmatchning som startsidan (Home.jsx),
// eftersom poster_url i databasen är en platshållare för flera filmer.
const IMAGE_ROOT = "/home";

const knownPosters = [
  { match: /spirited away/i, file: "poster-spirited-away.webp", genre: "Äventyr" },
  { match: /mononoke/i, file: "poster-mononoke.webp", genre: "Äventyr | Fantasy" },
  { match: /levande slott|howl/i, file: "poster-howls-castle.webp", genre: "Äventyr | Fantasy" },
  { match: /totoro/i, file: "poster-totoro.webp", genre: "Äventyr | Komedi" },
  { match: /metropolis/i, file: "poster-metropolis.webp", genre: "Science fiction" },
  { match: /innocence/i, file: "poster-innocence.webp", genre: "Science fiction" },
  { match: /akira/i, file: "poster-akira.webp", genre: "Science fiction | Action" },
  { match: /your name/i, file: "poster-your-name.webp", genre: "Romantik | Fantasy" },
];

// Ger bild och genre för en film: först startsidans bilder, sedan poster_url (om den inte är en platshållare)
function affischFor(titel, posterUrl) {
  const kand = knownPosters.find((p) => p.match.test(String(titel || "")));
  if (kand) return { src: `${IMAGE_ROOT}/${kand.file}`, genre: kand.genre };

  const bild = String(posterUrl || "");
  const platshallare = /placeholder|placehold|dummyimage|picsum|300\s*[x/]\s*450|\/300\/450/i.test(bild);
  return { src: bild && !platshallare ? bild : null, genre: null };
}

// Gör om en vanlig YouTube-länk till en inbäddningslänk
function tillEmbed(url) {
  if (!url) return null;
  if (url.includes("/embed/")) return url;
  const traff = url.match(/[?&]v=([^&]+)|youtu\.be\/([^?&]+)/);
  const videoId = traff && (traff[1] || traff[2]);
  return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
}

// Skådespelare kan komma som lista eller som text med komma emellan
function tillLista(varde) {
  if (!varde) return [];
  if (Array.isArray(varde)) return varde;
  return String(varde).split(",").map((namn) => namn.trim()).filter(Boolean);
}

// Visar affischen. Saknas bilden eller går den inte att ladda visas en ruta med titeln i stället.
function Affisch({ src, titel, className }) {
  // Kommer ihåg vilken bild som misslyckades, så en ny bild får en ny chans
  const [felSrc, setFelSrc] = useState(null);

  if (!src || felSrc === src) {
    return (
      <div
        role="img"
        aria-label={`Affisch saknas för ${titel}`}
        className={`${className} flex items-center justify-center bg-[#202026] p-2 text-center text-xs text-[#EEE7D6]/80`}
      >
        {titel}
      </div>
    );
  }
  return <img src={src} alt={`Affisch för ${titel}`} onError={() => setFelSrc(src)} className={className} />;
}

// Veckovy med visningar för en film (egen kod i den här filen, inga importer från gruppen)
function Visningar({ visningar, onSelect }) {
  const [veckoOffset, setVeckoOffset] = useState(0);
  const farger = ["#C8A96B", "#FF6685"];
  const nu = new Date();

  const idag = new Date();
  idag.setHours(0, 0, 0, 0);
  const veckoStart = new Date(idag);
  const veckodag = idag.getDay() === 0 ? 7 : idag.getDay(); // måndag = 1 ... söndag = 7
  veckoStart.setDate(idag.getDate() - veckodag + 1 + veckoOffset * 7);

  const dagar = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(veckoStart);
    d.setDate(veckoStart.getDate() + i);
    return d;
  });

  const tiderForDag = (dag) => {
    const datum = dag.toLocaleDateString("sv-SE");
    return visningar.filter((v) => {
      const start = new Date(v.start_time);
      const startDatum = start.toLocaleDateString("sv-SE", { timeZone: "Europe/Stockholm" });
      return startDatum === datum && start > nu;
    });
  };

  const veckoKnapp =
    "rounded border border-[#FF8A3D] px-3 py-1 text-sm disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <div className="w-full font-['Roboto'] text-[#EEE7D6]">
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          disabled={veckoOffset === 0}
          onClick={() => setVeckoOffset((v) => Math.max(0, v - 1))}
          className={veckoKnapp}
        >
          ← Föregående vecka
        </button>
        <button type="button" onClick={() => setVeckoOffset((v) => v + 1)} className={veckoKnapp}>
          Nästa vecka →
        </button>
      </div>

      {/* Mobil: scrolla i sidled. Från md: sju kolumner */}
      <div className="flex snap-x snap-mandatory gap-2 overflow-x-auto pb-3 md:grid md:grid-cols-7 md:overflow-visible">
        {dagar.map((dag) => {
          const tider = tiderForDag(dag);
          return (
            <div
              key={dag.toISOString()}
              className="min-h-[208px] w-[120px] shrink-0 snap-start rounded-md border border-[#FF8A3D] bg-[#070706] p-1.5 md:w-auto"
            >
              <h3 className="mb-1.5 whitespace-nowrap border-b border-[#FF8A3D] pb-2 font-['Roboto_Serif'] text-sm font-bold">
                <span className="text-[#FF8A3D]">
                  {dag.toLocaleDateString("sv-SE", { weekday: "short" }).replace(/^./, (c) => c.toUpperCase())}
                </span>{" "}
                {dag.toLocaleDateString("sv-SE", { day: "numeric", month: "short" })}
              </h3>

              <div className="space-y-1.5">
                {tider.length === 0 ? (
                  <p className="text-xs">Inga visningar denna dag</p>
                ) : (
                  tider.map((v, i) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => onSelect(v.id)}
                      className="w-full rounded-md border px-1.5 py-1 text-left text-xs transition-colors hover:bg-[#202026]"
                      style={{ borderColor: farger[i % 2], color: farger[i % 2] }}
                    >
                      <span className="block text-base font-bold leading-tight">
                        {new Date(v.start_time).toLocaleTimeString("sv-SE", {
                          timeZone: "Europe/Stockholm",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <span className="block text-[10px] leading-tight text-[#EEE7D6]">
                        {v.auditorium_name}
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function MovieDetail() {
  const { id: movieId } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Alla visningar: används för visningstiderna och för "Du kanske också gillar"
  const [screenings, setScreenings] = useState([]);

  useEffect(() => {
    fetch(`${API}/screenings`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setScreenings(Array.isArray(data) ? data : []))
      .catch(() => setScreenings([]));
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function fetchMovie() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`${API}/movies/${movieId}`);
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || TEXTER.fel);
        }
        const data = await res.json();
        if (isMounted) setMovie(data);
      } catch (err) {
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchMovie();
    return () => {
      isMounted = false;
    };
  }, [movieId]);

  if (loading) return <p className="mx-auto max-w-5xl px-6 py-8 text-white">{TEXTER.laddar}</p>;
  if (error) return <p className="mx-auto max-w-5xl px-6 py-8 text-red-500">{error}</p>;
  if (!movie) return null;

  // Kolumnerna description, director, actors, trailer_url, genre och release_year är antagna.
  // Visas bara om de finns i databasen. Kolla DESCRIBE movies; och rätta namnen.
  const actors = tillLista(movie.actors);
  const embed = tillEmbed(movie.trailer_url);
  const year = movie.release_year || movie.year;
  const affisch = affischFor(movie.title, movie.poster_url || movie.poster || movie.image_url);

  // Andra filmer (en per film) från visningslistan, utan den aktuella
  const andra = [];
  for (const s of screenings) {
    if (s.movie_id !== movie.id && !andra.some((f) => f.movie_id === s.movie_id)) {
      andra.push(s);
    }
  }
  const forslag = andra.slice(0, 3);

  const chip =
    "rounded border border-[#FF8A3D] bg-[#070706]/80 px-2.5 py-1 text-xs text-[#EEE7D6]";

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 text-[#EEE7D6] sm:px-6">
      <Link
        to="/screenings"
        className="mb-4 inline-flex items-center gap-2 text-sm text-white hover:text-[#FF9E5C]"
      >
        <span aria-hidden="true">←</span> {TEXTER.tillbaka}
      </Link>

      {/* Mobil: allt under varandra. Från sm: affisch till vänster, text till höger */}
      <section className="grid gap-5 sm:grid-cols-[13rem_1fr] sm:gap-6 md:grid-cols-[16rem_1fr]">
        <Affisch
          src={affisch.src}
          titel={movie.title}
          className="mx-auto aspect-[2/3] w-full max-w-[13rem] rounded border-2 border-[#FF8A3D] bg-[#202026] object-cover sm:max-w-none"
        />

        <div className="space-y-3">
          <h1 className="relative isolate inline-block font-['Roboto_Serif'] text-3xl font-black italic text-white sm:text-5xl">
            <span
              aria-hidden="true"
              className="absolute -inset-x-2 bottom-0 -z-10 h-3 -skew-x-12 bg-[#FF8A3D]/90"
            />
            {movie.title}
          </h1>

          {(movie.genre || affisch.genre) && (
            <p className="text-sm italic text-[#C8A96B]">{movie.genre || affisch.genre}</p>
          )}

          <ul className="flex flex-wrap gap-2">
            <li className={chip}>
              {movie.duration} {TEXTER.min}
            </li>
            <li className={chip}>
              {TEXTER.franAlder} {movie.age_limit} {TEXTER.ar}
            </li>
            {year && <li className={chip}>{year}</li>}
          </ul>

          <div className="space-y-2 font-['Roboto_Serif'] text-sm leading-relaxed sm:text-base">
            {movie.description && <p>{movie.description}</p>}
            {(movie.director || actors.length > 0) && (
              <p className="text-[#EEE7D6]/80">
                {movie.director && (
                  <>
                    <strong>{TEXTER.regi}:</strong> {movie.director}.{" "}
                  </>
                )}
                {actors.length > 0 && (
                  <>
                    <strong>{TEXTER.roller}:</strong> {actors.join(", ")}.
                  </>
                )}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Visningar för just den här filmen (gruppens egen komponent) */}
      <section className="mt-10">
        <h2 className="font-['Roboto_Serif'] text-3xl text-white sm:text-4xl">
          {TEXTER.visningar}
        </h2>
        <p className="mb-4 text-xs text-[#EEE7D6]/80">{TEXTER.visningarInfo}</p>
        <Visningar
          visningar={screenings.filter((s) => s.movie_id === Number(movieId))}
          onSelect={(screeningId) => navigate(`/screenings/${screeningId}/seats`)}
        />
      </section>

      {/* Trailer till vänster, andra filmer till höger. Under varandra på mobil */}
      <div className="mt-10 grid gap-8 md:grid-cols-[2fr_1fr]">
        {embed && (
          <section>
            <h2 className="mb-3 font-['Roboto_Serif'] text-3xl text-white sm:text-4xl">
              {TEXTER.trailer}
            </h2>
            <div className="aspect-video w-full overflow-hidden rounded border-2 border-[#FF8A3D]">
              <iframe
                src={embed}
                title={`${TEXTER.trailer} ${movie.title}`}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            </div>
            <a
              href={movie.trailer_url}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-block text-sm text-[#FF893C] hover:text-[#FF9E5C] hover:underline"
            >
              {TEXTER.trailerYoutube}
            </a>
          </section>
        )}

        {forslag.length > 0 && (
          <section className={embed ? "" : "md:col-span-2"}>
            <h2 className="mb-3 font-['Roboto_Serif'] text-xl text-white sm:text-2xl">
              {TEXTER.gillar}
            </h2>
            <ul className="space-y-3">
              {forslag.map((f) => (
                <li key={f.movie_id}>
                  <Link
                    to={`/movies/${f.movie_id}`}
                    className="flex items-center gap-3 rounded border border-[#EEE7D6]/20 bg-[#070706]/70 p-2 transition-colors hover:bg-[#202026]"
                  >
                    <Affisch
                      src={affischFor(f.movie_title, f.poster_url).src}
                      titel={f.movie_title}
                      className="h-20 w-14 shrink-0 overflow-hidden rounded border border-[#FF8A3D] bg-[#202026] object-cover text-[9px]"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-white">{f.movie_title}</p>
                      <p className="text-xs text-[#EEE7D6]/70">
                        {f.duration} {TEXTER.min} | {TEXTER.franAlder} {f.age_limit} {TEXTER.ar}
                      </p>
                    </div>
                    <span className="text-2xl text-[#FF8A3D]" aria-hidden="true">›</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
