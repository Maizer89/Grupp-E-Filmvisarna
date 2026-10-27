import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";

// Filmvisarnas startsida – React + Tailwind CSS, utan separat Home.css.
// Grafiken är hämtad från gruppens Figma-export. Filmer och tider kommer från API:et.

const IMAGE_ROOT = "/home";

const knownPosters = [
  { match: /spirited away/i, file: "poster-spirited-away.webp", genre: "Äventyr", rank: 0 },
  { match: /mononoke/i, file: "poster-mononoke.webp", genre: "Äventyr | Fantasy", rank: 1 },
  { match: /levande slott|howl/i, file: "poster-howls-castle.webp", genre: "Äventyr | Fantasy", rank: 2 },
  { match: /totoro/i, file: "poster-totoro.webp", genre: "Äventyr | Komedi", rank: 3 },
  { match: /metropolis/i, file: "poster-metropolis.webp", genre: "Science fiction", rank: 4 },
  { match: /innocence/i, file: "poster-innocence.webp", genre: "Science fiction", rank: 5 },
  { match: /akira/i, file: "poster-akira.webp", genre: "Science fiction | Action", rank: 6 },
  { match: /your name/i, file: "poster-your-name.webp", genre: "Romantik | Fantasy", rank: 7 },
];

function imageFor(movie) {
  const title = String(movie.title || movie.movie_title || "");
  const known = knownPosters.find((entry) => entry.match.test(title));

  if (known) {
    return {
      src: `${IMAGE_ROOT}/${known.file}`,
      genre: known.genre,
      rank: known.rank,
    };
  }

  const image = String(movie.poster_url || "");
  const placeholder =
    /placeholder|placehold|dummyimage|picsum|300\s*[x/]\s*450|\/300\/450/i.test(image);

  return {
    src: image && !placeholder ? image : null,
    genre: movie.genre || "Anime",
    rank: 99,
  };
}

function swedishDate(value, { compact = false } = {}) {
  const time = new Date(value);

  if (!Number.isFinite(time.getTime())) return "";

  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Stockholm",
    day: "numeric",
    month: compact ? "short" : "long",
    hour: compact ? undefined : "2-digit",
    minute: compact ? undefined : "2-digit",
  }).format(time);
}

function FilmPoster({ item, upcoming }) {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(item.image) && !failed;

  return (
    <div
      className={`relative w-full overflow-hidden bg-[#17110e] ${
        upcoming ? "aspect-[5/4]" : "aspect-[3/4]"
      }`}
    >
      {showImage ? (
        <img
          src={item.image}
          alt={`Affisch för ${item.title}`}
          loading="lazy"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover object-top transition-transform duration-500 ease-out group-hover:scale-[1.045] motion-reduce:transform-none"
        />
      ) : (
        <div className="relative flex h-full flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#17213a] via-[#16101d] to-[#5e241a] px-3 text-center">
          <div
            aria-hidden="true"
            className="absolute -left-8 top-7 h-3 w-44 -rotate-12 bg-[#FF8A3D]/30"
          />

          <div
            aria-hidden="true"
            className="absolute -right-12 bottom-10 h-7 w-56 -rotate-12 bg-[#FF8A3D]/30"
          />

          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="relative mb-3 h-8 w-8 text-[#FF8A3D]/80"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
          >
            <circle cx="12" cy="12" r="10" />
            <circle cx="8" cy="8" r="2" />
            <circle cx="16" cy="8" r="2" />
            <circle cx="8" cy="16" r="2" />
            <circle cx="16" cy="16" r="2" />
          </svg>

          <span className="relative font-serif text-base font-semibold leading-tight text-[#EEE7D6] sm:text-lg">
            {item.title}
          </span>
        </div>
      )}

      {upcoming && (
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/85 to-transparent px-2 pb-2 pt-8">
          <p className="line-clamp-2 font-serif text-[12px] font-semibold leading-tight text-[#EEE7D6] sm:text-sm">
            {item.title}
          </p>

          <p className="mt-2 text-center text-xs font-medium text-[#E9CF9B]">
            {item.dateText}
          </p>
        </div>
      )}
    </div>
  );
}

function MovieRail({
  title,
  items,
  upcoming = false,
  loading = false,
}) {
  const railRef = useRef(null);

  function scroll(direction) {
    if (!railRef.current) return;

    const amount = Math.round(railRef.current.clientWidth * 0.75);

    railRef.current.scrollBy({
      left: direction * amount,
      behavior: "smooth",
    });
  }

  return (
    <section aria-label={title}>
      <div className="mb-7 flex items-end justify-between gap-4 lg:mb-10">
        <h2 className="font-serif text-[30px] font-normal leading-tight text-[#EEE7D6] sm:text-[38px] lg:text-[46px]">
          {title}
        </h2>

        {!upcoming && (
          <Link
            to="/screenings"
            className="shrink-0 border-b border-[#C8A96B] pb-1 font-serif text-sm text-[#C8A96B] transition-colors hover:text-[#FF8A3D] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#FF8A3D] sm:text-base"
          >
            Se alla filmer <span aria-hidden="true">→</span>
          </Link>
        )}
      </div>

      <div className="relative">
        {/* Vänster pil */}
        <button
          type="button"
          aria-label={`Bläddra bakåt bland ${title.toLowerCase()}`}
          onClick={() => scroll(-1)}
          className="absolute -left-4 top-[42%] z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[#C8A96B] bg-[#070706]/90 text-[#C8A96B] transition-colors hover:bg-[#FF8A3D] hover:text-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF8A3D] sm:-left-6 lg:-left-12 lg:h-12 lg:w-12 xl:-left-14 2xl:-left-16"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>

        {/* Horisontell filmkarusell */}
        <div
          ref={railRef}
          className="w-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain scroll-smooth pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {/*
            Filmkorten centreras när alla får plats.

            Om korten är bredare än behållaren fungerar
            karusellen som vanligt med horisontell scrollning.
          */}
          <div
            className={`flex w-max min-w-full justify-center ${
              upcoming
                ? "gap-4 sm:gap-7 lg:gap-[48px]"
                : "gap-5 sm:gap-9 lg:gap-[80px]"
            }`}
          >
            {/* Laddningsanimation */}
            {loading &&
              Array.from(
                { length: upcoming ? 5 : 4 },
                (_, index) => (
                  <div
                    key={`loading-${index}`}
                    aria-hidden="true"
                    className={`shrink-0 animate-pulse rounded-lg border border-[#FF8A3D]/30 bg-[#17120f] ${
                      upcoming
                        ? "aspect-[5/4] w-[154px] sm:w-[175px] lg:w-[185px] 2xl:w-[210px] min-[1920px]:w-[230px] min-[2560px]:w-[250px]"
                        : "aspect-[3/4] w-[188px] sm:w-[204px] lg:w-[215px] 2xl:w-[250px] min-[1920px]:w-[280px] min-[2560px]:w-[330px]"
                    }`}
                  />
                )
              )}

            {/* Filmkort */}
            {!loading &&
              items.map((item, index) => (
                <article
                  key={item.key}
                  className={`group shrink-0 snap-start overflow-hidden rounded-lg border border-[#B9652F]/70 bg-[#070706]/95 shadow-[0_12px_30px_rgba(0,0,0,0.45)] transition-all duration-300 hover:-translate-y-1 hover:border-[#FF8A3D] focus-within:border-[#FF8A3D] motion-reduce:transform-none ${
                    upcoming
                      ? "w-[154px] sm:w-[175px] lg:w-[185px] 2xl:w-[210px] min-[1920px]:w-[230px] min-[2560px]:w-[250px]"
                      : "w-[188px] sm:w-[204px] lg:w-[215px] 2xl:w-[250px] min-[1920px]:w-[280px] min-[2560px]:w-[330px]"
                  }`}
                >
                  {upcoming ? (
                    <Link
                      to={item.href}
                      className="block focus-visible:outline-2 focus-visible:outline-[#FF8A3D]"
                      aria-label={`Visa visning: ${item.title}, ${item.dateText}`}
                    >
                      <FilmPoster item={item} upcoming />
                    </Link>
                  ) : (
                    <>
                      <Link
                        to={item.href}
                        className="block focus-visible:outline-2 focus-visible:outline-[#FF8A3D]"
                        aria-label={`Se ${item.title}`}
                      >
                        <FilmPoster item={item} upcoming={false} />
                      </Link>

                      <div className="relative flex h-[118px] flex-col px-2.5 pt-2 sm:h-[125px] 2xl:h-[132px] min-[1920px]:h-[142px]">
                        <h3 className="line-clamp-2 font-serif text-sm font-semibold leading-[1.05] text-white sm:text-[17px]">
                          {item.title}
                        </h3>

                        <p className="mt-1 line-clamp-1 font-serif text-[11px] leading-tight text-[#C8A96B]">
                          {item.genre}
                        </p>

                        {/* Centrerad biljettknapp */}
                        <Link
                          to={item.href}
                          aria-label={`${
                            item.hasScreening
                              ? "Boka biljetter till"
                              : "Se visningar för"
                          } ${item.title}`}
                          className="absolute bottom-0 left-1/2 block w-[88%] max-w-[200px] -translate-x-1/2 transition-transform duration-200 hover:scale-[1.035] focus-visible:outline-2 focus-visible:outline-[#FF8A3D] sm:max-w-[215px] 2xl:max-w-[235px] min-[1920px]:max-w-[250px] min-[2560px]:max-w-[285px]"
                        >
                          {item.hasScreening ? (
                            <img
                              src={`${IMAGE_ROOT}/${
                                index % 2 === 0
                                  ? "ticket-cream.webp"
                                  : "ticket-pink.webp"
                              }`}
                              alt="Boka biljetter"
                              className="block h-auto w-full"
                            />
                          ) : (
                            <span className="mx-auto block w-fit -rotate-6 border-2 border-[#070706] bg-[#C8A96B] px-4 py-2 text-xs font-semibold uppercase text-[#070706] shadow-[2px_2px_0_#C8A96B]">
                              Se visningar ↗
                            </span>
                          )}
                        </Link>
                      </div>
                    </>
                  )}
                </article>
              ))}
          </div>
        </div>

        {/* Höger pil */}
        <button
          type="button"
          aria-label={`Bläddra framåt bland ${title.toLowerCase()}`}
          onClick={() => scroll(1)}
          className="absolute -right-4 top-[42%] z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[#C8A96B] bg-[#070706]/90 text-[#C8A96B] transition-colors hover:bg-[#FF8A3D] hover:text-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF8A3D] sm:-right-6 lg:-right-12 lg:h-12 lg:w-12 xl:-right-14 2xl:-right-16"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>
      </div>

      {!loading && items.length === 0 && (
        <p className="rounded-lg border border-[#C8A96B]/40 bg-[#090808]/90 p-6 text-sm text-[#EEE7D6]">
          {upcoming
            ? "Det finns inga kommande visningar just nu."
            : "Det finns inga filmer att visa just nu."}
        </p>
      )}
    </section>
  );
}

function MobileInfo() {
  return (
    <div className="grid gap-5 rounded-2xl border border-[#FF8A3D]/70 bg-[#070706]/95 p-6 text-[#EEE7D6] lg:hidden">
      <div className="flex items-center gap-5">
        <span
          aria-hidden="true"
          className="w-12 text-center text-4xl text-[#FF8A3D]"
        >
          ♧
        </span>

        <div>
          <h3 className="font-black italic">FÖR ALLA ÅLDRAR</h3>
          <p className="font-serif text-sm text-[#EEE7D6]/75">
            Animefilm för hela familjen
          </p>
        </div>
      </div>

      <div className="flex items-center gap-5 border-y border-[#FF8A3D]/50 py-5">
        <span
          aria-hidden="true"
          className="w-12 text-center text-4xl text-[#FF8A3D]"
        >
          ★
        </span>

        <div>
          <h3 className="font-black italic">NOGGRANT UTVALT</h3>
          <p className="font-serif text-sm text-[#EEE7D6]/75">
            Tidlösa klassiker och nya favoriter
          </p>
        </div>
      </div>

      <div className="flex items-center gap-5">
        <span
          aria-hidden="true"
          className="w-12 text-center text-4xl text-[#FF8A3D]"
        >
          ◇
        </span>

        <div>
          <h3 className="font-black italic">ENKEL BOKNING</h3>
          <p className="font-serif text-sm text-[#EEE7D6]/75">
            Boka dina biljetter online på några klick
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [movies, setMovies] = useState([]);
  const [screenings, setScreenings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [now] = useState(() => Date.now());

  useEffect(() => {
    const controller = new AbortController();

    Promise.allSettled([
      fetch("/api/movies", {
        signal: controller.signal,
      }).then((response) => {
        if (!response.ok) {
          throw new Error("Kunde inte hämta filmer");
        }

        return response.json();
      }),

      fetch("/api/screenings", {
        signal: controller.signal,
      }).then((response) => {
        if (!response.ok) {
          throw new Error("Kunde inte hämta filmvisningar");
        }

        return response.json();
      }),
    ]).then(([movieResult, screeningResult]) => {
      if (controller.signal.aborted) return;

      if (
        movieResult.status === "fulfilled" &&
        Array.isArray(movieResult.value)
      ) {
        setMovies(movieResult.value);
      }

      if (
        screeningResult.status === "fulfilled" &&
        Array.isArray(screeningResult.value)
      ) {
        setScreenings(screeningResult.value);
      }

      if (
        movieResult.status === "rejected" ||
        screeningResult.status === "rejected"
      ) {
        setError(
          "Viss filminformation kunde inte hämtas. Kontrollera att backend är igång."
        );
      }

      setLoading(false);
    });

    return () => controller.abort();
  }, []);

  const { featured, upcoming } = useMemo(() => {
    const future = screenings
      .filter((screening) => {
        const value = Date.parse(screening.start_time);

        return Number.isFinite(value) && value > now;
      })
      .sort(
        (a, b) =>
          Date.parse(a.start_time) - Date.parse(b.start_time)
      );

    const firstScreeningByMovie = new Map();

    for (const screening of future) {
      const movieId = Number(screening.movie_id);

      if (!firstScreeningByMovie.has(movieId)) {
        firstScreeningByMovie.set(movieId, screening);
      }
    }

    const featured = movies
      .map((movie) => {
        const poster = imageFor(movie);
        const show = firstScreeningByMovie.get(
          Number(movie.id)
        );

        return {
          key: `movie-${movie.id}`,
          title: movie.title || "Film",
          image: poster.src,
          genre: poster.genre,
          rank: poster.rank,
          href: show
            ? `/screenings/${show.id}/seats`
            : "/screenings",
          hasScreening: Boolean(show),
        };
      })
      .sort((a, b) => a.rank - b.rank);

    const upcoming = future
      .slice(0, 16)
      .map((screening) => ({
        key: `screening-${screening.id}`,
        title: screening.movie_title || "Filmvisning",
        image: imageFor(screening).src,
        href: `/screenings/${screening.id}/seats`,
        dateText: swedishDate(
          screening.start_time,
          { compact: true }
        ),
      }));

    return {
      featured,
      upcoming,
    };
  }, [movies, screenings, now]);

  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-[#070706] text-[#EEE7D6]">
      
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[position:center_top] bg-[length:auto_100%] bg-no-repeat lg:bg-[length:100%_100%]"
        style={{
          backgroundImage: `url('${IMAGE_ROOT}/figma-background.webp')`,
        }}
      />

      {/* Header */}
      <header className="absolute inset-x-0 top-0 z-30 flex h-[82px] items-center justify-between border-b border-white/10 bg-[#070706]/80 px-4 backdrop-blur-[2px] sm:px-8 lg:top-[clamp(52px,4.95vw,72px)] lg:h-[150px] lg:px-[4.9%]">
        <Link
          to="/"
          onClick={() => setMenuOpen(false)}
          aria-label="Filmvisarna – startsida"
          className="flex min-w-0 items-center gap-1 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#FF8A3D] lg:gap-2"
        >
          <img
            src={`${IMAGE_ROOT}/logo-reel.webp`}
            alt=""
            className="h-12 w-12 shrink-0 object-contain sm:h-[65px] sm:w-[65px] lg:h-[103px] lg:w-[103px]"
          />

          <img
            src={`${IMAGE_ROOT}/figma-logo-type.webp`}
            alt="FILMVISARNA"
            className="h-auto w-[175px] object-contain sm:w-[235px] lg:w-[350px]"
          />
        </Link>

        <div className="flex items-center gap-4 lg:gap-9">
          <Link
            to="/screenings"
            aria-label="Sök filmer"
            className="hidden text-[#FF8A3D] transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#FF8A3D] sm:block"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-6 w-6 lg:h-8 lg:w-8"
              aria-hidden="true"
            >
              <circle cx="10.75" cy="10.75" r="6.5" />
              <path
                d="m16 16 5 5"
                strokeLinecap="round"
              />
            </svg>
          </Link>

          <button
            type="button"
            aria-label={
              menuOpen ? "Stäng menyn" : "Öppna menyn"
            }
            aria-controls="home-nav"
            aria-expanded={menuOpen}
            onClick={() =>
              setMenuOpen((open) => !open)
            }
            className="rounded-lg border border-[#FF8A3D]/60 px-3 py-1 text-2xl text-[#FF8A3D] sm:hidden"
          >
            {menuOpen ? "×" : "☰"}
          </button>

          <nav
            id="home-nav"
            aria-label="Huvudmeny"
            className={`${
              menuOpen ? "flex" : "hidden"
            } absolute inset-x-0 top-full flex-col gap-1 border-b border-[#FF8A3D]/30 bg-[#070706]/95 px-6 py-4 sm:static sm:flex sm:flex-row sm:items-center sm:gap-8 sm:border-0 sm:bg-transparent sm:p-0 lg:gap-11`}
          >
            <Link
              to="/"
              aria-current="page"
              onClick={() => setMenuOpen(false)}
              className="border-b-2 border-[#FF8A3D] px-1 py-2 font-serif text-[#C8A96B] transition-colors hover:text-[#FF8A3D]"
            >
              Hem
            </Link>

            <Link
              to="/screenings"
              onClick={() => setMenuOpen(false)}
              className="border-b-2 border-transparent px-1 py-2 font-serif text-[#EEE7D6] transition-colors hover:border-[#FF8A3D] hover:text-[#FF8A3D]"
            >
              Filmer
            </Link>

            <a
              href="#om-oss"
              onClick={() => setMenuOpen(false)}
              className="border-b-2 border-transparent px-1 py-2 font-serif text-[#EEE7D6] transition-colors hover:border-[#FF8A3D] hover:text-[#FF8A3D]"
            >
              Om oss
            </a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section
        aria-label="Välkommen till Filmvisarna"
        className="relative h-[530px] sm:h-[640px] lg:h-[clamp(720px,53.5vw,800px)]"
      >
        <h1 className="sr-only">
          Stora filmupplevelser på riktigt – anime för alla åldrar
        </h1>

        <img
          src={`${IMAGE_ROOT}/figma-headline.webp`}
          alt=""
          aria-hidden="true"
          fetchPriority="high"
          className="absolute left-[3%] top-[205px] w-[min(90%,490px)] drop-shadow-[0_8px_15px_rgba(0,0,0,0.5)] sm:top-[285px] sm:w-[min(70%,520px)] lg:left-[1.5%] lg:top-[51%] lg:w-[35.6%] lg:max-w-[540px] lg:drop-shadow-none"
        />
      </section>

      {/* Innehåll med bättre responsiv bredd */}
      <div className="relative z-10 mx-auto w-full max-w-[2200px] px-6 pb-24 sm:px-12 lg:px-[6%] lg:pb-24 2xl:px-[5%] min-[2560px]:px-[4%]">
        {error && (
          <p
            role="alert"
            className="mb-7 rounded-lg border border-[#FF8A3D]/50 bg-[#070706]/95 px-5 py-3 text-sm text-[#FFD0AF]"
          >
            {error}
          </p>
        )}

        {/* Aktuella filmer */}
        <section className="pt-7 lg:pt-12">
          <MovieRail
            title="Aktuella filmer"
            items={featured}
            loading={loading}
          />
        </section>

        {/* På bio snart */}
        <section className="mt-16 sm:mt-24 lg:mt-[115px]">
          <MovieRail
            title="På bio snart"
            items={upcoming}
            upcoming
            loading={loading}
          />
        </section>

        {/* Information */}
        <section
          id="om-oss"
          aria-label="Om Filmvisarna"
          className="mt-16 sm:mt-24 lg:mt-[170px]"
        >
          <MobileInfo />

          <img
            src={`${IMAGE_ROOT}/figma-info-strip.webp`}
            alt="För alla åldrar: Animefilm för hela familjen. Noggrant utvalt: Tidlösa klassiker och nya favoriter. Enkel bokning: Boka dina biljetter online på några klick."
            loading="lazy"
            className="hidden h-auto w-full lg:block"
          />
        </section>
      </div>
    </div>
  );
}