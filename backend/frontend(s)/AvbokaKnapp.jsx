import { useState } from 'react';
import { avboka } from './api';

// USER  15: avboka en framtida bokning.
// Används av MinaBokningar: <AvbokaKnapp bokningsnummer="FV-10001" vidAvbokad={laddaOm} />

export default function AvbokaKnapp({ bokningsnummer, vidAvbokad }) {
  const [fel, setFel] = useState('');
  const [arbetar, setArbetar] = useState(false);

  async function klick() {
    if (!window.confirm(`Vill du avboka bokning ${bokningsnummer}?`)) return;

    setFel('');
    setArbetar(true);
    try {
      await avboka(bokningsnummer);
      if (vidAvbokad) vidAvbokad(bokningsnummer);
    } catch (err) {
      setFel(err.message);
    } finally {
      setArbetar(false);
    }
  }

  return (
    <div className="shrink-0">
      <button
        type="button"
        onClick={klick}
        disabled={arbetar}
        className="rounded border-2 border-red-400 px-3 py-1 font-semibold text-red-400 hover:bg-red-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-white disabled:opacity-50"
      >
        {arbetar ? 'Avbokar…' : 'Avboka'}
      </button>
      {fel && <p role="alert" className="mt-1 text-sm font-medium text-red-400">{fel}</p>}
    </div>
  );
}
