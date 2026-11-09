import { useState } from "react";
import { Link } from "react-router-dom";

const HERO_IMAGE = "/home/figma-background.webp";


const INFO = {
  adress: "",
  telefon: "",
  epost: "",
};

// Orange penseldrag som dekoration
function Streck({ className }) {
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute block -skew-x-[30deg] -rotate-[18deg] bg-gradient-to-r from-[#E23A1A] to-[#FF8A3D] ${className}`}
    />
  );
}

function HeroBild() {
  const [fel, setFel] = useState(false);
  // Fast ruta (4:3) som fylls helt. Bilden zoomas in på den upplysta delen med skylten.
  const ram = "relative z-10 aspect-[4/3] w-full rounded-sm border border-[#FF8A3D]/70";

  if (fel) {
    return (
      <div
        role="img"
        aria-label="Bild på biografen Filmvisarna"
        className={`${ram} flex items-center justify-center bg-gradient-to-br from-[#17213a] via-[#16101d] to-[#5e241a]`}
      >
        <span
          className="bg-gradient-to-r from-[#E23A1A] to-[#FF8A3D] bg-clip-text text-4xl text-transparent"
          style={{ fontFamily: "Knewave, cursive" }}
        >
          FILMVISARNA
        </span>
      </div>
    );
  }
  return (
    <div className={`${ram} overflow-hidden bg-[#070706]`}>
      <img
        src={HERO_IMAGE}
        alt="Biografen Filmvisarna med neonskylt"
        onError={() => setFel(true)}
        className="absolute inset-0 h-full w-full origin-[75%_8%] scale-[1.15] object-cover object-top"
      />
    </div>
  );
}

export default function OmOss() {
  const kort =
    "rounded-lg bg-[#202026] p-6 text-[#EEE7D6] shadow-[0_8px_24px_rgba(0,0,0,0.35)]";
  const etikett = "text-[11px] font-semibold uppercase tracking-wider text-[#C8A96B]";

  return (
    <div className="relative z-10 mx-auto max-w-5xl overflow-x-clip px-6 py-8 text-[#EEE7D6]">
      <nav aria-label="Brödsmulor" className="mb-10 text-xs text-[#EEE7D6]/80">
        <Link to="/" className="hover:text-[#FF9E5C]">Hem</Link> / <span>Om oss</span>
      </nav>

      {/* Hero */}
      <section className="relative grid items-center gap-8 md:grid-cols-2">
        <div>
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-[#C8A96B]">
            Välkommen till Filmvisarna
          </p>
          <h1
            className="mb-4 text-4xl italic text-white sm:text-5xl"
            style={{ fontFamily: "Knewave, cursive" }}
          >
            OM FILMVISARNA
          </h1>
          <p className="font-['Roboto_Serif'] text-lg text-white">Din lokala biograf i Småstad.</p>
          <p className="mb-5 font-['Roboto_Serif'] text-lg text-[#C8A96B]">
            Här börjar ditt nästa biobesök.
          </p>
          <p className="mb-6 max-w-md text-sm leading-relaxed text-[#EEE7D6]/90">
            Upptäck filmer, hitta en visning och boka platser för en filmupplevelse tillsammans.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-8 rounded-sm bg-[#FF893C] px-5 py-3 text-sm font-semibold text-[#070706] transition-colors hover:bg-[#FF9E5C]"
          >
            Se filmer och visningstider <span aria-hidden="true">→</span>
          </Link>
        </div>

        <HeroBild />
      </section>

      <hr className="my-12 border-[#EEE7D6]/15" />

      {/* En plats för film */}
      <section className="relative">
        <Streck className="-right-10 top-2 hidden h-6 w-56 md:block" />
        <h2 className="mb-3 font-['Roboto_Serif'] text-3xl text-white">En plats för film</h2>
        <p className="mb-8 max-w-sm text-sm leading-relaxed text-[#EEE7D6]/90">
          Välkommen till Filmvisarna. Hos oss möts berättelser på stor duk och människor som vill
          uppleva dem tillsammans.
        </p>

        <div className="grid gap-5 md:grid-cols-2">
          <article className={kort}>
            <h3 className="mb-4 font-['Roboto_Serif'] text-lg text-white">
              <span className="mr-3 text-xs text-[#FF893C]">01</span>Våra salonger
            </h3>
            <p className="mb-5 text-sm leading-relaxed text-[#EEE7D6]/90">
              Vi har två salonger för våra filmvisningar.
              <br />
              Välj en film och en tid som passar dig.
            </p>
            <Link to="/" className="text-sm text-[#C8A96B] hover:text-[#FF893C]">
              Hitta din nästa filmupplevelse →
            </Link>
          </article>

          <article className={kort}>
            <h3 className="mb-4 font-['Roboto_Serif'] text-lg text-white">
              <span className="mr-3 text-xs text-[#FF893C]">02</span>Inför ditt besök
            </h3>
            <p className="text-sm leading-relaxed text-[#EEE7D6]/90">
              Boka dina platser online.
              <br />
              Visa ditt bokningsnummer och betala på biografen.
            </p>
          </article>
        </div>
      </section>

      {/* Hitta hit och kontakta oss */}
      <section className="relative mt-14 grid gap-8 md:grid-cols-2">
        <Streck className="-left-4 bottom-0 hidden h-5 w-44 md:block" />
        <div className="relative">
          <h2 className="mb-6 font-['Roboto_Serif'] text-3xl text-white">Hitta hit och kontakta oss</h2>
          <dl className="space-y-5 text-sm">
            <div>
              <dt className={etikett}>Adress</dt>
              <dd className="mt-1 min-h-[1.25rem]">{INFO.adress}</dd>
            </div>
            <div>
              <dt className={etikett}>Telefon</dt>
              <dd className="mt-1 min-h-[1.25rem]">{INFO.telefon}</dd>
            </div>
            <div>
              <dt className={etikett}>E-post</dt>
              <dd className="mt-1 min-h-[1.25rem]">{INFO.epost}</dd>
            </div>
          </dl>
        </div>

        <div className="flex min-h-[220px] flex-col items-center justify-center rounded-lg border border-[#EEE7D6]/10 bg-[#202026]/80 p-6 text-center">
          <svg aria-hidden="true" viewBox="0 0 24 24" className="mb-3 h-12 w-12 text-[#FF893C]" fill="none" stroke="currentColor" strokeWidth="1.4">
            <path d="M12 21s-7-6.2-7-11a7 7 0 1 1 14 0c0 4.8-7 11-7 11Z" />
            <circle cx="12" cy="10" r="2.5" />
          </svg>
          <p className="font-['Roboto_Serif'] text-lg text-white">Hitta till biografen</p>
          <p className="mt-2 text-xs text-[#EEE7D6]/70">Karta </p>
        </div>
      </section>
    </div>
  );
}
