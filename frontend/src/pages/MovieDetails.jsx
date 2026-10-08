import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

export default function MovieDetails() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:3000/api/movies/${id}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Filmen kunde inte hittas");
        }
        return res.json();
      })
      .then((data) => {
        setMovie(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="p-8 text-white">Laddar film...</div>;
  if (error) return <div className="p-8 text-red-500">Fel: {error}</div>;
  if (!movie) return null;

  return (
    <div className="max-w-4xl mx-auto p-6 text-white">
      <Link to="/" className="text-blue-400 hover:underline mb-4 inline-block">
        &larr; Tillbaka till filmer
      </Link>

      <div className="flex flex-col md:flex-row gap-6 bg-zinc-900 p-6 rounded-lg shadow-lg">
        {movie.poster_url && (
          <img
            src={movie.poster_url}
            alt={movie.title}
            className="w-full md:w-64 rounded-md object-cover"
          />
        )}
        <div className="flex flex-col gap-3">
          <h1 className="text-3xl font-bold">{movie.title}</h1>
          <div className="flex gap-4 text-sm text-zinc-400">
            <span>Speltid: {movie.duration} min</span>
            <span>Åldersgräns: {movie.age_limit} år</span>
          </div>
          <p className="text-zinc-200 mt-2">{movie.description}</p>
        </div>
      </div>
    </div>
  );
}
