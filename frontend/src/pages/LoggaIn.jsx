import { useState } from "react";
import { Link } from "react-router-dom";
import { loggaIn } from "../api";

export default function LoggaIn({ vidInloggad }) {
  const [epost, setEpost] = useState("");
  const [losenord, setLosenord] = useState("");
  const [fel, setFel] = useState("");
  const [laddar, setLaddar] = useState(false);

  async function skicka(e) {
    e.preventDefault();

    if (laddar) return;

    setFel("");
    setLaddar(true);

    try {
      const anvandare = await loggaIn(epost, losenord);

      if (vidInloggad) {
        vidInloggad(anvandare);
      }
    } catch (err) {
      setFel(err.message);
    } finally {
      setLaddar(false);
    }
  }

  const faltStil =
    "w-full rounded-lg border border-[#555560] bg-[#202026] px-4 py-3 text-[#EEE7D6] outline-none transition-colors placeholder:text-[#EEE7D6]/35 focus:border-[#FF8A3D] focus:ring-1 focus:ring-[#FF8A3D]";

  return (
    <main className="relative z-10 flex min-h-[75vh] items-center justify-center px-4 py-12 sm:px-6">
      <div className="w-full max-w-md rounded-2xl border border-[#C8A96B]/40 bg-[#171719]/95 p-6 shadow-[0_12px_50px_rgba(0,0,0,0.45)] sm:p-10">
        {/* Rubrik */}
        <div className="mb-8 text-center">
          <h1
            className="mb-3 text-3xl font-semibold text-[#EEE7D6] sm:text-4xl"
            style={{ fontFamily: "'Roboto Serif', serif" }}
          >
            Välkommen tillbaka
          </h1>

          <p className="text-sm text-[#EEE7D6]/65">
            Logga in för att se och hantera dina bokningar.
          </p>
        </div>

        {/* Formulär */}
        <form onSubmit={skicka} className="space-y-5">
          <div>
            <label
              htmlFor="login-email"
              className="mb-2 block text-sm font-medium text-[#EEE7D6]"
            >
              E-postadress
            </label>

            <input
              id="login-email"
              type="email"
              required
              autoComplete="email"
              value={epost}
              onChange={(e) => setEpost(e.target.value)}
              placeholder="namn@exempel.se"
              className={faltStil}
            />
          </div>

          <div>
            <label
              htmlFor="login-password"
              className="mb-2 block text-sm font-medium text-[#EEE7D6]"
            >
              Lösenord
            </label>

            <input
              id="login-password"
              type="password"
              required
              autoComplete="current-password"
              value={losenord}
              onChange={(e) => setLosenord(e.target.value)}
              placeholder="Ange ditt lösenord"
              className={faltStil}
            />
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

          {/* Logga in */}
          <button
            type="submit"
            disabled={laddar}
            className="w-full rounded-lg bg-[#FF8A3D] px-5 py-3.5 font-semibold text-[#070706] transition-colors hover:bg-[#FF9E5C] focus:outline-none focus:ring-2 focus:ring-[#FF8A3D] focus:ring-offset-2 focus:ring-offset-[#171719] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {laddar ? "Loggar in..." : "Logga in"}
          </button>
        </form>

        {/* Skapa konto */}
        <div className="mt-8 border-t border-[#C8A96B]/20 pt-6 text-center">
          <p className="text-sm text-[#EEE7D6]/65">Har du inget konto?</p>

          <Link
            to="/skapa-konto"
            className="mt-2 inline-block font-semibold text-[#FF8A3D] transition-colors hover:text-[#FF9E5C] hover:underline"
          >
            Skapa konto
          </Link>
        </div>
      </div>
    </main>
  );
}
