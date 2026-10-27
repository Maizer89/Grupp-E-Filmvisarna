import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

// User story 4 (filmdetalj) och 22 (responsiv).

const API = "http://localhost:3000/api";

const TEXTER = {
  laddar: "Hämtar film...",
  fel: "Kunde inte hämta filmen",
  tillbaka: "Tillbaka",
  regissor: "Regissör",
  skadespelare: "Skådespelare",
  trailer: "Trailer",
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
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  if (loading) return <p className="p-6 text-zinc-400">{TEXTER.laddar}</p>;
  if (error) return <p className="p-6 text-red-500">{error}</p>;
  if (!movie) return null;

  // Kolumnerna description, director, actors och trailer_url är antagna.
  // Visas bara om de finns i databasen. Kolla DESCRIBE movies; och rätta namnen.
  const actors = tillLista(movie.actors);
  const embed = tillEmbed(movie.trailer_url);

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 text-white">
      <Link to="/screenings" className="mb-4 inline-block text-blue-400 hover:underline">
        ← {TEXTER.tillbaka}
      </Link>

      {/* Mobil: allt under varandra. Från md: bild till vänster, text till höger */}
      <article className="grid gap-6 bg-zinc-900 p-4 sm:p-6 rounded-lg border border-zinc-800 md:grid-cols-[16rem_1fr]">
        <img
          src={movie.poster_url}
          alt={movie.title}
          className="w-full max-w-xs mx-auto md:max-w-none rounded bg-zinc-800 object-cover"
        />

        <div className="space-y-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">{movie.title}</h1>
            <p className="text-sm text-zinc-400">
              {movie.duration} {TEXTER.min} | {movie.age_limit} {TEXTER.ar}
            </p>
          </div>

          {movie.description && (
            <p className="leading-relaxed text-zinc-300">{movie.description}</p>
          )}

          {movie.director && (
            <p>
              <span className="font-semibold">{TEXTER.regissor}:</span>{" "}
              <span className="text-zinc-300">{movie.director}</span>
            </p>
          )}

          {actors.length > 0 && (
            <div>
              <h2 className="font-semibold">{TEXTER.skadespelare}</h2>
              <ul className="mt-1 flex flex-wrap gap-2">
                {actors.map((namn) => (
                  <li key={namn} className="rounded-full bg-zinc-800 px-3 py-1 text-sm text-zinc-300">
                    {namn}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {embed && (
          <section className="md:col-span-2">
            <h2 className="mb-2 font-semibold">{TEXTER.trailer}</h2>
            <div className="aspect-video w-full overflow-hidden rounded">
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
              className="mt-2 inline-block text-blue-400 hover:underline"
            >
              {TEXTER.trailerYoutube}
            </a>
          </section>
        )}
      </article>
    </div>
  );
}
