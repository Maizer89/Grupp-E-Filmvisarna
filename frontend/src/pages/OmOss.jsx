import { useState } from "react";
import { Link } from "react-router-dom";

const HERO_IMAGE = "/home/figma-background.webp";

const INFO = {
  adress: "Årstaängsvägen 31, 117 43 Stockholm",
  telefon: "",
  epost: "info@animefilmer.se",
};

const MAPS_URL =
  `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    INFO.adress
  )}`;


const SNACKS = [
  {
    nummer: "01",
    titel: "Popcorn",
    text: "En bioklassiker till filmen.",
    produkter: [
      { namn: "Liten popcorn", pris: 35 },
      { namn: "Mellan popcorn", pris: 45 },
      { namn: "Stor popcorn", pris: 55 },
    ],
  },
  {
    nummer: "02",
    titel: "Dryck",
    text: "Något svalkande till dina favoriter.",
    produkter: [
      { namn: "Läsk 33 cl", pris: 25 },
      { namn: "Läsk 50 cl", pris: 35 },
      { namn: "Mineralvatten 50 cl", pris: 25 },
    ],
  },
  {
    nummer: "03",
    titel: "Sött & salt",
    text: "Små favoriter för stora filmstunder.",
    produkter: [
      { namn: "Godispåse 100 g", pris: 30 },
      { namn: "Chokladkaka 100 g", pris: 30 },
      { namn: "Chips 40 g", pris: 25 },
    ],
  },
];


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

  const ram =
    "relative z-10 aspect-[4/3] w-full rounded-sm border border-[#FF8A3D]/70";

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

  const etikett =
    "text-[11px] font-semibold uppercase tracking-wider text-[#C8A96B]";

  const kontaktLank =
    "rounded-sm underline decoration-[#C8A96B]/50 underline-offset-4 hover:text-[#FF9E5C] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#FF893C]";

  return (
    <div className="relative z-10 mx-auto max-w-5xl overflow-x-clip px-6 py-8 text-[#EEE7D6]">
      <nav
        aria-label="Brödsmulor"
        className="mb-10 text-xs text-[#EEE7D6]/80"
      >
        <Link to="/" className="hover:text-[#FF9E5C]">
          Hem
        </Link>
        {" / "}
        <span aria-current="page">Om oss</span>
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

          <p className="font-['Roboto_Serif'] text-lg text-white">
            Din biograf i Stockholm.
          </p>

          <p className="mb-5 font-['Roboto_Serif'] text-lg text-[#C8A96B]">
            Här börjar ditt nästa biobesök.
          </p>

          <p className="mb-6 max-w-md text-sm leading-relaxed text-[#EEE7D6]/90">
            Upptäck filmer, hitta en visning och boka platser för en
            filmupplevelse tillsammans.
          </p>

          <Link
            to="/"
            className="inline-flex items-center gap-8 rounded-sm bg-[#FF893C] px-5 py-3 text-sm font-semibold text-[#070706] transition-colors hover:bg-[#FF9E5C] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#FF893C]"
          >
            Se filmer och visningstider
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        <HeroBild />
      </section>

      <hr className="my-12 border-[#EEE7D6]/15" />

      {/* En plats för film */}
      <section
        aria-labelledby="om-biografen-heading"
        className="relative"
      >
        <Streck className="-right-10 top-2 hidden h-6 w-56 md:block" />

        <h2
          id="om-biografen-heading"
          className="mb-3 font-['Roboto_Serif'] text-3xl text-white"
        >
          En plats för film
        </h2>

        <p className="mb-8 max-w-sm text-sm leading-relaxed text-[#EEE7D6]/90">
          Välkommen till Filmvisarna. Hos oss möts berättelser på stor
          duk och människor som vill uppleva dem tillsammans.
        </p>

        <div className="grid gap-5 md:grid-cols-2">
          <article className={kort}>
            <h3 className="mb-4 font-['Roboto_Serif'] text-lg text-white">
              <span className="mr-3 text-xs text-[#FF893C]">01</span>
              Våra salonger
            </h3>

            <p className="mb-5 text-sm leading-relaxed text-[#EEE7D6]/90">
              Vi har två salonger för våra filmvisningar.
              <br />
              Välj en film och en tid som passar dig.
            </p>

            <Link
              to="/"
              className="rounded-sm text-sm text-[#C8A96B] hover:text-[#FF893C] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#FF893C]"
            >
              Hitta din nästa filmupplevelse →
            </Link>
          </article>

          <article className={kort}>
            <h3 className="mb-4 font-['Roboto_Serif'] text-lg text-white">
              <span className="mr-3 text-xs text-[#FF893C]">02</span>
              Inför ditt besök
            </h3>

            <p className="text-sm leading-relaxed text-[#EEE7D6]/90">
              Boka dina platser online.
              <br />
              Visa ditt bokningsnummer och betala på biografen.
            </p>
          </article>
        </div>
      </section>

      {/* Gott till filmen */}
      <section
        aria-labelledby="snacks-heading"
        className="relative mt-14"
      >
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-[#C8A96B]">
          Inför filmstart
        </p>

        <h2
          id="snacks-heading"
          className="mb-3 font-['Roboto_Serif'] text-3xl text-white"
        >
          Gott till filmen
        </h2>

        <p className="mb-6 max-w-xl text-sm leading-relaxed text-[#EEE7D6]/90">
          Popcorn, något att dricka eller en söt favorit? Köp något
          gott på biografen och slå dig ner inför filmen.
        </p>

        <div className="grid gap-5 md:grid-cols-3">
          {SNACKS.map((kategori) => (
            <article
              key={kategori.titel}
              className={`${kort} min-w-0 border border-[#C8A96B]/20`}
            >
              <span className="mb-4 block text-xs font-semibold text-[#FF893C]">
                {kategori.nummer}
              </span>

              <h3 className="mb-3 font-['Roboto_Serif'] text-xl text-white">
                {kategori.titel}
              </h3>

              <p className="mb-5 text-sm leading-relaxed text-[#EEE7D6]/80">
                {kategori.text}
              </p>

              <dl className="divide-y divide-[#C8A96B]/15">
                {kategori.produkter.map((produkt) => (
                  <div
                    key={produkt.namn}
                    className="flex items-baseline justify-between gap-4 py-3"
                  >
                    <dt className="min-w-0 text-sm text-[#EEE7D6]">
                      {produkt.namn}
                    </dt>

                    <dd className="shrink-0 whitespace-nowrap text-sm font-semibold tabular-nums text-[#C8A96B]">
                      {produkt.pris} kr
                    </dd>
                  </div>
                ))}
              </dl>
            </article>
          ))}
        </div>

        <p className="mt-4 text-xs leading-relaxed text-[#C8A96B]">
          Snacks och dryck köps på plats på biografen före visningen.
        </p>
      </section>

      {/* Hitta hit och kontakta oss */}
      <section
        id="hitta-oss"
        aria-labelledby="kontakt-heading"
        className="relative mt-14 grid scroll-mt-24 gap-8 md:grid-cols-2"
      >
        <Streck className="-left-4 bottom-0 hidden h-5 w-44 md:block" />

        <div className="relative min-w-0">
          <h2
            id="kontakt-heading"
            className="mb-6 font-['Roboto_Serif'] text-3xl text-white"
          >
            Hitta hit och kontakta oss
          </h2>

          <dl className="space-y-5 text-sm">
            <div>
              <dt className={etikett}>Adress</dt>
              <dd className="mt-2 leading-relaxed">
                {INFO.adress}
              </dd>
            </div>

            {INFO.telefon && (
              <div>
                <dt className={etikett}>Telefon</dt>
                <dd className="mt-2">
                  <a
                    href={`tel:${INFO.telefon.replace(/\s/g, "")}`}
                    className={kontaktLank}
                  >
                    {INFO.telefon}
                  </a>
                </dd>
              </div>
            )}

            <div>
              <dt className={etikett}>E-post</dt>
              <dd className="mt-2">
                <a
                  href={`mailto:${INFO.epost}`}
                  className={`break-words ${kontaktLank}`}
                >
                  {INFO.epost}
                </a>
              </dd>
            </div>
          </dl>
        </div>

        <div className="flex min-h-[260px] flex-col items-center justify-center rounded-lg border border-[#C8A96B]/25 bg-[#202026] p-8 text-center shadow-[0_8px_24px_rgba(0,0,0,0.35)]">
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="mb-4 h-10 w-10 text-[#FF893C]"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M12 21s-7-6.2-7-11a7 7 0 1 1 14 0c0 4.8-7 11-7 11Z" />
            <circle cx="12" cy="10" r="2.5" />
          </svg>

          <h3 className="font-['Roboto_Serif'] text-xl text-white">
            Vi ses på biografen
          </h3>

          <p className="mt-3 text-sm leading-relaxed text-[#EEE7D6]/80">
            {INFO.adress}
          </p>

          <a
            href={MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex min-h-11 items-center justify-center gap-6 rounded-sm bg-[#FF893C] px-6 py-3 text-sm font-semibold text-[#070706] transition-colors hover:bg-[#FF9E5C] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#FF893C]"
          >
            Hitta oss
            <span aria-hidden="true">↗</span>
            <span className="sr-only">
              – öppnar Google Maps i en ny flik
            </span>
          </a>

          <p className="mt-3 text-xs text-[#EEE7D6]/60">
            Vägbeskrivning i Google Maps
          </p>
        </div>
      </section>
    </div>
  );
}