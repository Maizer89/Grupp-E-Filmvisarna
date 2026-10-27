import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import logo from "../assets/image-15@2x.png";
import searchIcon from "../assets/Search.svg";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [movies, setMovies] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!searchOpen && !menuOpen) return;

    const controller = new AbortController();

    async function fetchMovies() {
      try {
        const response = await fetch("/api/movies", {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Kunde inte hämta filmer");
        }

        const data = await response.json();
        setMovies(data);
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Fel vid hämtning av filmer:", error);
        }
      }
    }

    fetchMovies();

    return () => controller.abort();
  }, [searchOpen, menuOpen]);

  const filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(searchQuery.trim().toLowerCase()),
  );

  const navLinkClass = ({ isActive }) =>
    `relative pb-2 transition-colors hover:text-[#FF8A3D] ${
      isActive
        ? "text-[#FF8A3D] after:absolute after:bottom-0 after:left-0 after:h-[3px] after:w-full after:bg-[#FF8A3D]"
        : "text-[#EEE7D6]"
    }`;

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <header className="relative z-20 w-full border-b border-[#C8A96B] bg-[#070706] shadow-[0_2px_12px_rgba(200,169,107,0.2)]">
      {/* Desktop */}
      <div className="hidden min-h-[90px] w-full items-center justify-between gap-8 px-6 md:flex lg:px-10">
        <Link to="/" className="flex shrink-0 items-center gap-3">
          <img src={logo} alt="" className="h-[65px] w-[65px] object-contain" />

          <span
            className="bg-gradient-to-r from-[#E23A1A] to-[#FF8A3D] bg-clip-text text-[42px] text-transparent"
            style={{ fontFamily: "Knewave, cursive" }}
          >
            FILMVISARNA
          </span>
        </Link>

        <nav
          aria-label="Huvudnavigation"
          className="flex items-center gap-7 text-[18px]"
          style={{ fontFamily: "'Roboto Serif', serif" }}
        >
          <button
            type="button"
            aria-label={searchOpen ? "Stäng sökfält" : "Sök film"}
            aria-expanded={searchOpen}
            aria-controls="desktop-search"
            onClick={() => setSearchOpen((open) => !open)}
          >
            <img src={searchIcon} alt="" className="h-7 w-7" />
          </button>

          <NavLink to="/" end className={navLinkClass}>
            Hem
          </NavLink>

          <NavLink to="/screenings" className={navLinkClass}>
            Filmer
          </NavLink>

          <span className="cursor-default pb-2 text-[#EEE7D6]">Om oss</span>

          <span className="h-7 w-px bg-[#C8A96B]/40" />

          <NavLink to="/logga-in" className={navLinkClass}>
            Logga in
          </NavLink>
        </nav>
      </div>

      {searchOpen && (
        <div
          id="desktop-search"
          className="hidden border-t border-[#C8A96B]/30 bg-[#070706] px-10 py-4 md:block"
        >
          <input
            type="search"
            placeholder="Sök efter film..."
            aria-label="Sök efter film"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-md border border-[#C8A96B] bg-[#171717] px-4 py-3 text-[#EEE7D6] outline-none placeholder:text-[#EEE7D6]/50 focus:border-[#FF8A3D]"
          />
          {searchQuery.trim() && (
            <div className="mt-3 rounded-md border border-[#C8A96B]/40 bg-[#171717]">
              {filteredMovies.length > 0 ? (
                filteredMovies.map((movie) => (
                  <Link
                    key={movie.id}
                    to="/screenings"
                    onClick={() => {
                      setSearchOpen(false);
                      setSearchQuery("");
                    }}
                    className="flex items-center gap-4 border-b border-[#C8A96B]/20 px-4 py-3 text-[#EEE7D6] transition-colors last:border-b-0 hover:bg-[#FF8A3D]/20"
                  >
                    <img
                      src={movie.poster_url}
                      alt={`Affisch för ${movie.title}`}
                      className="h-16 w-12 shrink-0 rounded object-cover"
                    />

                    <span className="font-serif text-base">{movie.title}</span>
                  </Link>
                ))
              ) : (
                <p className="px-4 py-3 text-[#EEE7D6]/60">
                  Inga filmer hittades.
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Mobilheader */}
      <div className="flex min-h-[65px] items-center gap-3 px-4 md:hidden">
        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "Stäng meny" : "Öppna meny"}
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
          className="flex flex-col gap-[5px] p-2"
        >
          <span className="h-[2px] w-6 bg-[#FF8A3D]" />
          <span className="h-[2px] w-6 bg-[#FF8A3D]" />
          <span className="h-[2px] w-6 bg-[#FF8A3D]" />
        </button>

        <Link
          to="/"
          onClick={closeMenu}
          className="ml-10 flex items-center gap-2"
        >
          <img src={logo} alt="" className="h-10 w-10 object-contain" />

          <span
            className="bg-gradient-to-r from-[#E23A1A] to-[#FF8A3D] bg-clip-text text-xl text-transparent"
            style={{ fontFamily: "Knewave, cursive" }}
          >
            FILMVISARNA
          </span>
        </Link>
      </div>

      {/* Mobilmeny */}
      {menuOpen && (
        <nav
          id="mobile-navigation"
          aria-label="Mobilnavigering"
          className="absolute left-0 top-full w-full border-t-[3px] border-[#C8A96B] bg-[#484848] p-3 shadow-2xl md:hidden"
        >
          <div className="mb-3 flex items-center gap-3 rounded-md border border-[#C8A96B] bg-[#171717] px-3 py-3 text-[#FF8A3D]">
            <img src={searchIcon} alt="" className="h-5 w-5" />

            <input
              type="search"
              placeholder="Sök film..."
              aria-label="Sök efter film"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="min-w-0 flex-1 bg-transparent text-sm text-[#EEE7D6] outline-none placeholder:text-[#FF8A3D]"
            />
          </div>
          {searchQuery.trim() && (
            <div className="mb-3 max-h-64 overflow-y-auto rounded-md border border-[#C8A96B]/40 bg-[#171717]">
              {filteredMovies.length > 0 ? (
                filteredMovies.map((movie) => (
                  <Link
                    key={movie.id}
                    to="/screenings"
                    onClick={() => {
                      setMenuOpen(false);
                      setSearchQuery("");
                    }}
                    className="flex items-center gap-3 border-b border-[#C8A96B]/20 px-3 py-2 text-[#EEE7D6] transition-colors last:border-b-0 hover:bg-[#FF8A3D]/20"
                  >
                    <img
                      src={movie.poster_url}
                      alt={`Affisch för ${movie.title}`}
                      className="h-16 w-12 shrink-0 rounded object-cover"
                    />

                    <span className="font-serif text-sm">{movie.title}</span>
                  </Link>
                ))
              ) : (
                <p className="px-3 py-3 text-sm text-[#EEE7D6]/60">
                  Inga filmer hittades.
                </p>
              )}
            </div>
          )}

          <NavLink
            to="/"
            end
            onClick={closeMenu}
            className="flex items-center justify-between px-2 py-3 text-[#FF8A3D]"
          >
            Hem <span aria-hidden="true">›</span>
          </NavLink>

          <NavLink
            to="/screenings"
            onClick={closeMenu}
            className="flex items-center justify-between px-2 py-3 text-[#FF8A3D]"
          >
            Filmer <span aria-hidden="true">›</span>
          </NavLink>

          <div className="flex cursor-default items-center justify-between px-2 py-3 text-[#FF8A3D]">
            Om oss <span aria-hidden="true">›</span>
          </div>

          <div className="my-2 border-t border-[#C8A96B]/40" />

          <NavLink
            to="/logga-in"
            onClick={closeMenu}
            className="flex items-center justify-between px-2 py-3 text-[#FF8A3D]"
          >
            Logga in <span aria-hidden="true">›</span>
          </NavLink>
        </nav>
      )}
    </header>
  );
}
