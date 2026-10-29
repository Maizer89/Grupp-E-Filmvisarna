import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ScreeningSelector from "../components/ScreeningSelector";
import useScreeningSchedule from "../hooks/useScreeningSchedule";

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

export default function MovieDetail() {
  const { id: movieId } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { screenings } = useScreeningSchedule();

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

  const actors = tillLista(movie.actors);
  const embed = tillEmbed(movie.trailer_url);
  const year = movie.release_year || movie.year;

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
        <img
          src={movie.poster_url}
          alt={movie.title}
          className="mx-auto w-full max-w-[13rem] rounded border-2 border-[#FF8A3D] bg-[#202026] object-cover sm:max-w-none"
        />

        <div className="space-y-3">
          <h1 className="relative isolate inline-block font-['Roboto_Serif'] text-3xl font-black italic text-white sm:text-5xl">
            <span
              aria-hidden="true"
              className="absolute -inset-x-2 bottom-0 -z-10 h-3 -skew-x-12 bg-[#FF8A3D]/90"
            />
            {movie.title}
          </h1>

          {movie.genre && (
            <p className="text-sm italic text-[#C8A96B]">{movie.genre}</p>
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

      {/* Visningar för just den här filmen*/}
      <section className="mt-10">
        <h2 className="font-['Roboto_Serif'] text-3xl text-white sm:text-4xl">
          {TEXTER.visningar}
        </h2>
        <p className="mb-4 text-xs text-[#EEE7D6]/80">{TEXTER.visningarInfo}</p>
        <ScreeningSelector
          movieId={movieId}
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
                    <img
                      src={f.poster_url}
                      alt={f.movie_title}
                      className="h-20 w-14 shrink-0 rounded border border-[#FF8A3D] bg-[#202026] object-cover"
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
