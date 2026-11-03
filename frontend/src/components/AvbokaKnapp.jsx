import { useState } from "react";
import { avboka } from "../api";

export default function AvbokaKnapp({ bokningsnummer, vidAvbokad }) {
  const [fel, setFel] = useState("");
  const [arbetar, setArbetar] = useState(false);

  async function klick() {
    if (arbetar) return;

    if (!window.confirm(`Vill du avboka bokning ${bokningsnummer}?`)) {
      return;
    }

    setFel("");
    setArbetar(true);

    try {
      await avboka(bokningsnummer);

      if (vidAvbokad) {
        await vidAvbokad(bokningsnummer);
      }
    } catch (err) {
      setFel(err.message);
    } finally {
      setArbetar(false);
    }
  }

  return (
    <div className="w-full sm:w-auto">
      <button
        type="button"
        onClick={klick}
        disabled={arbetar}
        className="w-full rounded-lg border border-red-400/60 bg-red-500/5 px-5 py-2.5 text-sm font-semibold text-red-400 transition-colors hover:border-red-400 hover:bg-red-500/15 focus:outline-none focus:ring-2 focus:ring-red-400 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
      >
        {arbetar ? "Avbokar..." : "Avboka"}
      </button>

      {fel && (
        <p role="alert" className="mt-2 max-w-xs text-sm text-red-400">
          {fel}
        </p>
      )}
    </div>
  );
}
