import { useState } from "react";

function ActorCard({ actor }) {
  const [imageError, setImageError] = useState(false);

  const showImage = actor.profile_url && !imageError;

  return (
    <article className="w-full min-w-0 max-w-[150px] overflow-hidden rounded-lg border border-[#FF8A3D]/40 bg-[#070706]">
      <div className="flex aspect-square items-center justify-center overflow-hidden bg-[#141210]">
        {showImage ? (
          <img
            src={actor.profile_url}
            alt={actor.name}
            loading="lazy"
            onError={() => setImageError(true)}
            className="h-full w-full object-cover"
          />
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className="h-14 w-14 text-[#C8A96B]/60 sm:h-16 sm:w-16"
          >
            <circle cx="12" cy="8" r="5" />
            <path d="M20 21a8 8 0 0 0-16 0" />
          </svg>
        )}
      </div>

      <div className="p-2">
        <h3 className="text-xs font-semibold text-[#EEE7D6] sm:text-sm">
          {actor.name}
        </h3>

        <p className="mt-1 text-xs text-[#EEE7D6]/60">{actor.character_name}</p>
      </div>
    </article>
  );
}

export default function MovieCast({ cast = [] }) {
  if (!cast.length) return null;

  return (
    <section className="mt-10">
      <h2 className="mb-5 font-['Roboto_Serif'] text-2xl text-[#EEE7D6] sm:text-3xl">
        Skådespelare
      </h2>

      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
        {cast.map((actor) => (
          <ActorCard key={actor.id} actor={actor} />
        ))}
      </div>
    </section>
  );
}
