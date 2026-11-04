import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { hamtaMinaBokningar } from "../api";
import AvbokaKnapp from "../components/AvbokaKnapp";

function visaTid(iso) {
  return new Date(iso).toLocaleString("sv-SE", {
    dateStyle: "long",
    timeStyle: "short",
  });
}

function Bokning({ bokning, vidAvbokad, historik = false }) {
  return (
    <li className="rounded-xl border border-[#C8A96B]/25 bg-[#202026] p-4 transition-colors hover:border-[#C8A96B]/50 sm:p-6">
      {/* Poster, bokningsinformation och QR-kod */}
      <div className="flex flex-wrap items-start gap-4 sm:flex-nowrap sm:gap-6">
        {/* Filmposter */}
        {bokning.posterUrl && (
          <img
            src={bokning.posterUrl}
            alt={`Poster för ${bokning.title}`}
            className="w-20 shrink-0 rounded-lg object-cover sm:w-28"
          />
        )}

        {/* Bokningsinformation */}
        <div className="min-w-0 flex-1">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <h3
              className="text-lg font-semibold text-[#EEE7D6] sm:text-2xl"
              style={{ fontFamily: "'Roboto Serif', serif" }}
            >
              {bokning.title}
            </h3>

            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                historik
                  ? "bg-[#EEE7D6]/10 text-[#EEE7D6]/60"
                  : "bg-[#FF8A3D]/15 text-[#FF8A3D]"
              }`}
            >
              {historik ? "Genomförd" : "Kommande"}
            </span>
          </div>

          <div className="space-y-3 text-sm text-[#EEE7D6]/75">
            <p>{visaTid(bokning.startTime)}</p>
            <p>{bokning.auditorium}</p>

            <p>
              {bokning.seats?.length
                ? bokning.seats.join(", ")
                : "Inga platser angivna"}
            </p>
          </div>
        </div>

        {/* QR-kod och avbokningsknapp */}
        <div className="flex w-full shrink-0 flex-row items-center justify-between gap-4 sm:w-auto sm:flex-col sm:items-center">
          <div className="rounded-lg bg-white p-2">
            <QRCodeSVG
              value={bokning.bookingNumber}
              size={100}
              level="M"
              title="QR-kod för din bokning"
            />
          </div>

          {!historik && vidAvbokad && (
            <AvbokaKnapp
              bokningsnummer={bokning.bookingNumber}
              vidAvbokad={vidAvbokad}
            />
          )}
        </div>
      </div>

      {/* Bokningsnummer längst ner */}
      <div className="mt-5 border-t border-[#C8A96B]/15 pt-4">
        <p className="mb-1 text-xs text-[#EEE7D6]/45">Bokningsnummer</p>

        <p className="break-all font-mono text-xs text-[#EEE7D6]/75 sm:text-sm">
          {bokning.bookingNumber}
        </p>
      </div>
    </li>
  );
}

export default function MinaBokningar() {
  const [bokningar, setBokningar] = useState(null);
  const [fel, setFel] = useState("");

  async function ladda() {
    try {
      setFel("");
      setBokningar(await hamtaMinaBokningar());
    } catch (err) {
      setFel(
        err.status === 401
          ? "Logga in för att se dina bokningar."
          : err.message,
      );
    }
  }

  useEffect(() => {
    ladda();
  }, []);

  return (
    <main className="relative z-10 mx-auto min-h-[75vh] w-full max-w-5xl px-4 py-12 text-[#EEE7D6] sm:px-6">
      <div className="mb-10 text-center">
        <h1
          className="mb-3 text-3xl font-semibold sm:text-4xl"
          style={{ fontFamily: "'Roboto Serif', serif" }}
        >
          Mina bokningar
        </h1>

        <p className="text-sm text-[#EEE7D6]/65">
          Här hittar du dina kommande biobesök och tidigare bokningar.
        </p>
      </div>

      {fel ? (
        <div className="rounded-xl border border-red-500/30 bg-[#171719]/95 p-6 text-center">
          <p role="alert" className="text-red-400">
            {fel}
          </p>

          <Link
            to="/logga-in"
            className="mt-4 inline-block text-[#FF8A3D] hover:underline"
          >
            Gå till inloggning
          </Link>
        </div>
      ) : !bokningar ? (
        <p className="py-12 text-center text-[#EEE7D6]/65">
          Hämtar dina bokningar...
        </p>
      ) : (
        <div className="space-y-10">
          {/* Kommande bokningar */}
          <section>
            <div className="mb-5 flex items-center gap-3">
              <span className="h-7 w-1 rounded-full bg-[#FF8A3D]" />

              <h2
                className="text-2xl font-semibold"
                style={{ fontFamily: "'Roboto Serif', serif" }}
              >
                Kommande bokningar
              </h2>
            </div>

            {bokningar.upcoming.length === 0 ? (
              <div className="rounded-xl border border-[#C8A96B]/25 bg-[#171719]/95 px-6 py-10 text-center">
                <p className="mb-5 text-[#EEE7D6]/65">
                  Du har inga kommande bokningar.
                </p>

                <Link
                  to="/"
                  className="inline-block rounded-lg bg-[#FF8A3D] px-5 py-3 font-semibold text-[#070706] transition-colors hover:bg-[#FF9E5C]"
                >
                  Utforska filmer
                </Link>
              </div>
            ) : (
              <ul className="space-y-4">
                {bokningar.upcoming.map((bokning) => (
                  <Bokning
                    key={bokning.bookingNumber}
                    bokning={bokning}
                    vidAvbokad={ladda}
                  />
                ))}
              </ul>
            )}
          </section>

          {/* Bokningshistorik */}
          <section>
            <div className="mb-5 flex items-center gap-3">
              <span className="h-7 w-1 rounded-full bg-[#C8A96B]" />

              <h2
                className="text-2xl font-semibold"
                style={{ fontFamily: "'Roboto Serif', serif" }}
              >
                Bokningshistorik
              </h2>
            </div>

            {bokningar.history.length === 0 ? (
              <div className="rounded-xl border border-[#C8A96B]/25 bg-[#171719]/95 px-6 py-8 text-center">
                <p className="text-[#EEE7D6]/60">
                  Du har ingen bokningshistorik ännu.
                </p>
              </div>
            ) : (
              <ul className="space-y-4">
                {bokningar.history.map((bokning) => (
                  <Bokning
                    key={bokning.bookingNumber}
                    bokning={bokning}
                    historik
                  />
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </main>
  );
}
