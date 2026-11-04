import { useState } from "react";
import { Link } from "react-router-dom";
import { registrera } from "../api";

const faltStil =
  "w-full rounded-lg border border-[#555560] bg-[#202026] px-4 py-3 text-[#EEE7D6] outline-none transition-colors placeholder:text-[#EEE7D6]/35 focus:border-[#FF8A3D] focus:ring-1 focus:ring-[#FF8A3D]";

export default function SkapaKonto({ vidKlar }) {
  const [fornamn, setFornamn] = useState("");
  const [efternamn, setEfternamn] = useState("");
  const [epost, setEpost] = useState("");
  const [losenord, setLosenord] = useState("");
  const [fel, setFel] = useState("");
  const [klart, setKlart] = useState(false);
  const [laddar, setLaddar] = useState(false);

  async function skicka(e) {
    e.preventDefault();

    if (laddar) return;

    setFel("");
    setLaddar(true);

    try {
      await registrera(fornamn, efternamn, epost, losenord);
      setKlart(true);

      if (vidKlar) {
        vidKlar();
      }
    } catch (err) {
      setFel(err.message);
    } finally {
      setLaddar(false);
    }
  }

  return (
    <main className="relative z-10 flex min-h-[75vh] items-center justify-center px-4 py-12 sm:px-6">
      <div className="w-full max-w-md rounded-2xl border border-[#C8A96B]/40 bg-[#171719]/95 p-6 shadow-[0_12px_50px_rgba(0,0,0,0.45)] sm:p-10">
        {klart ? (
          // Bekräftelse efter registrering
          <div className="text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-[#FF8A3D]/40 bg-[#FF8A3D]/10">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-8 w-8 text-[#FF8A3D]"
                aria-hidden="true"
              >
                <path
                  d="M5 12l4 4L19 6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <h1
              className="mb-4 text-3xl font-semibold text-[#EEE7D6]"
              style={{ fontFamily: "'Roboto Serif', serif" }}
            >
              Kontot är skapat!
            </h1>

            <p className="mb-8 text-sm leading-relaxed text-[#EEE7D6]/70">
              Din registrering är klar. Du kan nu logga in och hantera dina
              bokningar hos Filmvisarna.
            </p>

            <Link
              to="/logga-in"
              className="inline-block w-full rounded-lg bg-[#FF8A3D] px-5 py-3.5 text-center font-semibold text-[#070706] transition-colors hover:bg-[#FF9E5C]"
            >
              Gå till inloggning
            </Link>
          </div>
        ) : (
          <>
            {/* Rubrik */}
            <div className="mb-8 text-center">
              <h1
                className="mb-3 text-3xl font-semibold text-[#EEE7D6] sm:text-4xl"
                style={{ fontFamily: "'Roboto Serif', serif" }}
              >
                Skapa konto
              </h1>

              <p className="text-sm text-[#EEE7D6]/65">
                Registrera dig för att enkelt kunna se och hantera dina
                bokningar.
              </p>
            </div>

            {/* Registreringsformulär */}
            <form onSubmit={skicka} className="space-y-5">
              <div>
                <label
                  htmlFor="register-firstname"
                  className="mb-2 block text-sm font-medium text-[#EEE7D6]"
                >
                  Förnamn
                </label>

                <input
                  id="register-firstname"
                  type="text"
                  required
                  maxLength={100}
                  autoComplete="given-name"
                  value={fornamn}
                  onChange={(e) => setFornamn(e.target.value)}
                  placeholder="Ditt förnamn"
                  className={faltStil}
                />
              </div>

              <div>
                <label
                  htmlFor="register-lastname"
                  className="mb-2 block text-sm font-medium text-[#EEE7D6]"
                >
                  Efternamn
                </label>

                <input
                  id="register-lastname"
                  type="text"
                  required
                  maxLength={100}
                  autoComplete="family-name"
                  value={efternamn}
                  onChange={(e) => setEfternamn(e.target.value)}
                  placeholder="Ditt efternamn"
                  className={faltStil}
                />
              </div>

              <div>
                <label
                  htmlFor="register-email"
                  className="mb-2 block text-sm font-medium text-[#EEE7D6]"
                >
                  E-postadress
                </label>

                <input
                  id="register-email"
                  type="email"
                  required
                  maxLength={255}
                  autoComplete="email"
                  value={epost}
                  onChange={(e) => setEpost(e.target.value)}
                  placeholder="namn@exempel.se"
                  className={faltStil}
                />
              </div>

              <div>
                <label
                  htmlFor="register-password"
                  className="mb-2 block text-sm font-medium text-[#EEE7D6]"
                >
                  Lösenord
                </label>

                <input
                  id="register-password"
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={losenord}
                  onChange={(e) => setLosenord(e.target.value)}
                  placeholder="Minst 8 tecken"
                  className={faltStil}
                />

                <p className="mt-2 text-xs text-[#EEE7D6]/50">
                  Lösenordet måste innehålla minst 8 tecken.
                </p>
              </div>

              {/* Felmeddelande */}
              {fel && (
                <p
                  role="alert"
                  className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400"
                >
                  {fel}
                </p>
              )}

              {/* Registreringsknapp */}
              <button
                type="submit"
                disabled={laddar}
                className="w-full rounded-lg bg-[#FF8A3D] px-5 py-3.5 font-semibold text-[#070706] transition-colors hover:bg-[#FF9E5C] focus:outline-none focus:ring-2 focus:ring-[#FF8A3D] focus:ring-offset-2 focus:ring-offset-[#171719] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {laddar ? "Skapar konto..." : "Skapa konto"}
              </button>
            </form>

            {/* Länk till inloggning */}
            <div className="mt-8 border-t border-[#C8A96B]/20 pt-6 text-center">
              <p className="text-sm text-[#EEE7D6]/65">
                Har du redan ett konto?
              </p>

              <Link
                to="/logga-in"
                className="mt-2 inline-block font-semibold text-[#FF8A3D] transition-colors hover:text-[#FF9E5C] hover:underline"
              >
                Logga in
              </Link>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
