import { Link } from "react-router-dom";
import logo from "../assets/image-15@2x.png";

const socialaMedier = [
  {
    namn: "Facebook",
    ikon: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.23.2 2.23.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12Z" />
      </svg>
    ),
  },
  {
    namn: "Instagram",
    ikon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="2" y="2" width="20" height="20" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    namn: "X",
    ikon: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.634 7.584H.478l8.6-9.83L0 1.154h7.594l5.243 6.932L18.901 1.153Zm-1.29 19.49h2.039L6.486 3.24H4.298L17.61 20.644Z" />
      </svg>
    ),
  },
];

export default function Footer() {
  return (
    <footer className="w-full border-t border-[#C8A96B] bg-[#070706] text-[#EEE7D6]">
      <div className="flex w-full flex-col items-center justify-between gap-6 px-6 py-6 md:flex-row lg:px-10">
        {/* Samma logotyp som i headern, men mindre */}
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="" className="h-10 w-10 object-contain" />

          <span
            className="bg-gradient-to-r from-[#E23A1A] to-[#FF8A3D] bg-clip-text text-2xl text-transparent"
            style={{ fontFamily: "Knewave, cursive" }}
          >
            FILMVISARNA
          </span>
        </Link>

        {/* Sociala medier */}
        <div className="flex items-center gap-7">
          {socialaMedier.map((social) => (
            <div key={social.namn} className="group relative">
              <button
                type="button"
                aria-label={social.namn}
                className="block size-7 cursor-pointer text-[#EEE7D6] transition-colors hover:text-[#FF8A3D] focus-visible:text-[#FF8A3D]"
              >
                {social.ikon}
              </button>

              {/* Tooltip */}
              <span
                role="tooltip"
                className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-3 -translate-x-1/2 whitespace-nowrap rounded-md bg-[#EEE7D6] px-3 py-2 text-xs font-medium text-[#202026] opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
              >
                Länkar kommer snart
              </span>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-4 text-sm text-[#EEE7D6]/70">
          <button
            type="button"
            onClick={() => {
              window.dispatchEvent(new Event("open-cookie-settings"));
            }}
            className="transition-colors hover:text-[#FF8A3D]"
          >
            Cookieinställningar
          </button>

          <span className="text-[#C8A96B]/40">|</span>

          <p>© {new Date().getFullYear()} Filmvisarna</p>
        </div>
      </div>
    </footer>
  );
}
