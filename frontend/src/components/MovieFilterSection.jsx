import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AgeRatingFilter from "./AgeRatingFilter.jsx";

// Formatera datum enligt svensk tidszon.
const dateFormatter = new Intl.DateTimeFormat("sv-SE", {
  timeZone: "Europe/Stockholm",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const screeningFormatter = new Intl.DateTimeFormat("sv-SE", {
  timeZone: "Europe/Stockholm",
  weekday: "short",
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

// Returnerar datum i formatet YYYY-MM-DD.
function stockholmDate(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const parts = Object.fromEntries(
    dateFormatter
      .formatToParts(date)
      .map(({ type, value }) => [type, value])
  );

  return `${parts.year}-${parts.month}-${parts.day}`;
}

// Affisch med reservdesign om bilden saknas.
function MoviePoster({ src, title }) {
  const [failedSrc, setFailedSrc] = useState(null);

  if (!src || failedSrc === src) {
    return (
      <div className="flex h-full items-center justify-center bg-[#202026] p-5 text-center">
        <div>
          <span className="mb-3 block text-4xl text-[#FF8A3D]">
            ✦
          </span>

          <span className="font-serif text-lg text-[#EEE7D6]">
            {title}
          </span>
        </div>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={`Affisch för ${title}`}
      loading="lazy"
      onError={() => setFailedSrc(src)}
      className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105 motion-reduce:transform-none"
    />
  );
}

// US 11 + US 12
// Filmsektion med datum- och åldersfiltrering.
export default function MovieFilterSection({
  movies = [],
  screenings = [],
  loading = false,
  imageFor,
}) {
  const [selectedDate, setSelectedDate] = useState("");
  const [maxAge, setMaxAge] = useState("all");
  const [now, setNow] = useState(() => Date.now());

  // Håller visningstiderna uppdaterade.
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const today = stockholmDate(now);

  // Filtrera filmer och hitta deras nästa visning.
  const { filteredMovies, nextScreeningByMovie } = useMemo(() => {
    const upcomingScreenings = screenings
      .filter((screening) => {
        const start = new Date(screening.start_time).getTime();

        return Number.isFinite(start) && start > now;
      })
      .sort(
        (a, b) =>
          new Date(a.start_time).getTime() -
          new Date(b.start_time).getTime()
      );

    const nextScreeningByMovie = new Map();

    for (const screening of upcomingScreenings) {
      // Kontrollera valt datum.
      if (
        selectedDate &&
        stockholmDate(screening.start_time) !== selectedDate
      ) {
        continue;
      }

      const movieId = String(screening.movie_id);

      // Spara bara första kommande visningen per film.
      if (!nextScreeningByMovie.has(movieId)) {
        nextScreeningByMovie.set(movieId, screening);
      }
    }

    // Filtrera filmer på åldersgräns och datum.
    const filteredMovies = movies.filter((movie) => {
      // US 12: Åldersfilter.
      if (maxAge !== "all") {
        if (
          movie.age_limit === null ||
          movie.age_limit === undefined ||
          movie.age_limit === ""
        ) {
          return false;
        }

        const ageLimit = Number(movie.age_limit);

        if (
          !Number.isFinite(ageLimit) ||
          ageLimit > Number(maxAge)
        ) {
          return false;
        }
      }

      // US 11: Datumfilter.
      // Om inget datum valts visas hela filmutbudet.
      if (selectedDate) {
        return nextScreeningByMovie.has(String(movie.id));
      }

      return true;
    });

    return {
      filteredMovies,
      nextScreeningByMovie,
    };
  }, [movies, screenings, selectedDate, maxAge, now]);

  const hasFilters = selectedDate !== "" || maxAge !== "all";

  function resetFilters() {
    setSelectedDate("");
    setMaxAge("all");
  }

  return (
    <section
      id="filmer-pa-bio"
      aria-labelledby="filmer-heading"
      className="relative scroll-mt-24"
    >
      {/* RUBRIK */}

      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#FF8A3D]">
            DIN NÄSTA FILMUPPLEVELSE
          </p>

          <h2
            id="filmer-heading"
            className="font-serif text-4xl text-[#EEE7D6] sm:text-5xl"
          >
            Filmer på bio
          </h2>

          <p className="mt-3 max-w-xl text-sm leading-relaxed text-[#EEE7D6]/65 sm:text-base">
            Upptäck vårt filmutbud och hitta en film som passar dig.
            Filtrera efter datum och åldersgräns.
          </p>
        </div>

        {!loading && (
          <p
            aria-live="polite"
            className="text-sm text-[#C8A96B]"
          >
            {filteredMovies.length}{" "}
            {filteredMovies.length === 1 ? "film" : "filmer"}
          </p>
        )}
      </div>

      {/* FILTERPANEL */}

      <div className="relative mb-10 overflow-hidden rounded-2xl border border-[#C8A96B]/35 bg-[#141211] p-5 shadow-xl sm:p-6">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#FF8A3D] to-transparent" />

        <div className="grid gap-6 lg:grid-cols-[1fr_260px_auto] lg:items-end">
          {/* DATUMFILTER */}

          <div>
            <label
              htmlFor="home-date-filter"
              className="mb-3 block text-xs font-semibold uppercase tracking-[0.15em] text-[#C8A96B]"
            >
              01 / Välj datum
            </label>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSelectedDate("")}
                aria-pressed={selectedDate === ""}
                className={`min-h-11 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                  selectedDate === ""
                    ? "border-[#FF8A3D] bg-[#FF8A3D] text-[#070706]"
                    : "border-[#C8A96B]/40 bg-[#202026] text-[#EEE7D6] hover:border-[#FF8A3D]"
                }`}
              >
                Alla dagar
              </button>

              <button
                type="button"
                onClick={() => setSelectedDate(today)}
                aria-pressed={selectedDate === today}
                className={`min-h-11 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                  selectedDate === today
                    ? "border-[#FF8A3D] bg-[#FF8A3D] text-[#070706]"
                    : "border-[#C8A96B]/40 bg-[#202026] text-[#EEE7D6] hover:border-[#FF8A3D]"
                }`}
              >
                Idag
              </button>

              <input
                id="home-date-filter"
                type="date"
                min={today}
                value={selectedDate}
                onChange={(event) =>
                  setSelectedDate(event.target.value)
                }
                aria-label="Välj visningsdatum"
                className="min-h-11 min-w-0 rounded-lg border border-[#C8A96B]/40 bg-[#202026] px-3 py-2 text-sm text-[#EEE7D6] outline-none [color-scheme:dark] focus:border-[#FF8A3D]"
              />
            </div>
          </div>

          {/* ÅLDERSFILTER */}

        {/* ÅLDERSFILTER */}

          <AgeRatingFilter
            id="home-age-filter"
            value={maxAge}
            onChange={setMaxAge}
            compact
          />

          {/* RENSA FILTER */}

          <button
            type="button"
            onClick={resetFilters}
            disabled={!hasFilters}
            className="min-h-11 rounded-lg px-4 py-2 text-sm font-medium text-[#C8A96B] transition-colors hover:bg-[#202026] hover:text-[#FF8A3D] disabled:cursor-default disabled:opacity-40"
          >
            Rensa filter ↺
          </button>
        </div>
      </div>

      {/* LADDNING */}

      {loading ? (
        <div
          aria-label="Laddar filmer"
          className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
        >
          {Array.from({ length: 4 }, (_, index) => (
            <div
              key={index}
              className="aspect-[2/3] animate-pulse rounded-xl bg-[#202026]"
            />
          ))}
        </div>
      ) : filteredMovies.length === 0 ? (
        /* INGA MATCHANDE FILMER */

        <div
          role="status"
          className="rounded-xl border border-[#C8A96B]/30 bg-[#141211] px-6 py-12 text-center"
        >
          <h3 className="font-serif text-2xl text-[#EEE7D6]">
            Inga filmer matchar dina val
          </h3>

          <p className="mt-3 text-sm text-[#EEE7D6]/65">
            Prova ett annat datum eller en annan åldersgräns.
          </p>

          {hasFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="mt-5 rounded-lg bg-[#FF8A3D] px-5 py-3 text-sm font-semibold text-[#070706] hover:bg-[#FFA366]"
            >
              Visa alla filmer
            </button>
          )}
        </div>
      ) : (
        /* FILMKORT */

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4 xl:grid-cols-5">
          {filteredMovies.map((movie) => {
            const poster = imageFor(movie);

            const nextScreening = nextScreeningByMovie.get(
              String(movie.id)
            );

            const ageLimit = Number(movie.age_limit);

            const ageText =
              movie.age_limit == null ||
              movie.age_limit === "" ||
              !Number.isFinite(ageLimit)
                ? "Ålder ej angiven"
                : ageLimit === 0
                  ? "Barntillåten"
                  : `Från ${ageLimit} år`;

            return (
              <article
                key={movie.id}
                className="group min-w-0 overflow-hidden rounded-xl border border-[#C8A96B]/25 bg-[#141211] transition-all duration-300 hover:-translate-y-1 hover:border-[#FF8A3D]/80 hover:shadow-xl motion-reduce:transform-none"
              >
                <Link
                  to={`/movies/${movie.id}`}
                  aria-label={`Se detaljer och visningar för ${movie.title}`}
                  className="flex h-full flex-col focus-visible:outline-2 focus-visible:outline-[#FF8A3D]"
                >
                  {/* AFFISCH */}

                  <div className="relative aspect-[2/3] overflow-hidden bg-[#202026]">
                    <MoviePoster
                      src={poster.src}
                      title={movie.title}
                    />

                    <span className="absolute left-2 top-2 rounded-md border border-[#C8A96B]/40 bg-[#070706]/90 px-2 py-1 text-[10px] font-medium text-[#EEE7D6] sm:left-3 sm:top-3 sm:text-xs">
                      {ageText}
                    </span>
                  </div>

                  {/* FILMINFORMATION */}

                  <div className="flex flex-1 flex-col p-3 sm:p-4">
                    <p className="mb-1 truncate text-[10px] uppercase tracking-wider text-[#C8A96B]">
                      {poster.genre}
                    </p>

                    <h3 className="line-clamp-2 font-serif text-base font-semibold text-[#EEE7D6] sm:text-xl">
                      {movie.title}
                    </h3>

                    <p className="mt-3 text-xs text-[#EEE7D6]/65 sm:text-sm">
                      {nextScreening
                        ? `Nästa: ${screeningFormatter.format(
                            new Date(nextScreening.start_time)
                          )}`
                        : "Inga planerade visningar"}
                    </p>

                    <div className="mt-auto flex items-center justify-between border-t border-[#C8A96B]/20 pt-4">
                      <span className="text-xs font-semibold uppercase tracking-wider text-[#FF8A3D] sm:text-sm">
                        Film & tider
                      </span>

                      <span
                        aria-hidden="true"
                        className="text-xl text-[#FF8A3D]"
                      >
                        ↗
                      </span>
                    </div>
                  </div>
                </Link>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}