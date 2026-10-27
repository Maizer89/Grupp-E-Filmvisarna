import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import logo from "../assets/image-15@2x.png";
import searchIcon from "../assets/Search.svg";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

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
          <button type="button" aria-label="Sök film">
            <img src={searchIcon} alt="" className="h-7 w-7" />
          </button>

          <NavLink to="/" end className={navLinkClass}>
            Hem
          </NavLink>

          <NavLink to="/screenings" className={navLinkClass}>
            Filmer
          </NavLink>

          <span className="cursor-default text-[#EEE7D6]">Om oss</span>

          <span className="h-7 w-px bg-[#C8A96B]/40" />

          <NavLink to="/logga-in" className={navLinkClass}>
            Logga in
          </NavLink>

          <NavLink to="/skapa-konto" className={navLinkClass}>
            Skapa konto
          </NavLink>
        </nav>
      </div>

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

        <Link to="/" onClick={closeMenu} className="flex items-center gap-2">
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
            <span className="text-sm">Sök film</span>
          </div>

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

          <NavLink
            to="/skapa-konto"
            onClick={closeMenu}
            className="flex items-center justify-between px-2 py-3 text-[#FF8A3D]"
          >
            Skapa konto <span aria-hidden="true">›</span>
          </NavLink>
        </nav>
      )}
    </header>
  );
}
