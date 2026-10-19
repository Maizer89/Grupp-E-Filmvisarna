import { useEffect, useState } from "react";
import { hamtaMinaBokningar } from "../api";
import AvbokaKnapp from "../components/AvbokaKnapp";

// USER  18: se mina bokningar och bokningshistorik.
// Använd: <MinaBokningar />

const kort =
  "mx-auto my-8 max-w-2xl rounded-lg bg-black/75 p-6 text-white shadow-lg backdrop-blur-sm";

function visaTid(iso) {
  return new Date(iso).toLocaleString("sv-SE", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function Bokning({ bokning, vidAvbokad }) {
  return (
    <li className="flex items-start justify-between gap-4 rounded border border-gray-500 p-3">
      <div>
        <p className="text-lg font-semibold">{bokning.title}</p>
        <p>
          {visaTid(bokning.startTime)} · {bokning.auditorium}
        </p>
        <p>Stolar: {bokning.seats || "–"}</p>
        <p className="text-sm text-gray-300">
          Bokningsnummer: {bokning.bookingNumber}
        </p>
      </div>
      {vidAvbokad && (
        <AvbokaKnapp
          bokningsnummer={bokning.bookingNumber}
          vidAvbokad={vidAvbokad}
        />
      )}
    </li>
  );
}

export default function MinaBokningar() {
  const [bokningar, setBokningar] = useState(null); // null = laddar
  const [fel, setFel] = useState("");

  async function ladda() {
    try {
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

  if (fel) return <p className={kort}>{fel}</p>;
  if (!bokningar) return <p className={kort}>Laddar…</p>;

  return (
    <div className={`${kort} flex flex-col gap-8`}>
      <section>
        <h2 className="mb-3 text-xl font-bold text-orange-400">
          Kommande bokningar
        </h2>
        {bokningar.upcoming.length === 0 ? (
          <p>Du har inga kommande bokningar.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {bokningar.upcoming.map((b) => (
              <Bokning key={b.bookingNumber} bokning={b} vidAvbokad={ladda} />
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-xl font-bold text-orange-400">
          Bokningshistorik
        </h2>
        {bokningar.history.length === 0 ? (
          <p>Ingen historik än.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {bokningar.history.map((b) => (
              <Bokning key={b.bookingNumber} bokning={b} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
