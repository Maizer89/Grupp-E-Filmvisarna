import { useState } from "react";
import { registrera } from "../api";

// USER  16: registrera nytt konto.
// Använd: <SkapaKonto vidKlar={() => navigate('/logga-in')} />

const kort =
  "mx-auto my-8 max-w-sm rounded-lg bg-black/75 p-6 text-white shadow-lg backdrop-blur-sm";
const faltStil =
  "rounded border border-gray-300 bg-white p-2 text-black focus:outline-none focus:ring-2 focus:ring-orange-500";

export default function SkapaKonto({ vidKlar }) {
  const [fornamn, setFornamn] = useState("");
  const [efternamn, setEfternamn] = useState("");
  const [epost, setEpost] = useState("");
  const [losenord, setLosenord] = useState("");
  const [fel, setFel] = useState("");
  const [klart, setKlart] = useState(false);

  async function skicka(e) {
    e.preventDefault();
    setFel("");
    try {
      await registrera(fornamn, efternamn, epost, losenord);
      setKlart(true);
      if (vidKlar) vidKlar();
    } catch (err) {
      setFel(err.message);
    }
  }

  if (klart) {
    return (
      <p className={`${kort} text-center`}>
        Kontot skapades! Du kan nu logga in.
      </p>
    );
  }

  return (
    <form onSubmit={skicka} className={`${kort} flex flex-col gap-4`}>
      <h1 className="text-2xl font-bold">Skapa konto</h1>

      <label className="flex flex-col gap-1">
        Förnamn
        <input
          type="text"
          required
          value={fornamn}
          onChange={(e) => setFornamn(e.target.value)}
          className={faltStil}
        />
      </label>

      <label className="flex flex-col gap-1">
        Efternamn
        <input
          type="text"
          required
          value={efternamn}
          onChange={(e) => setEfternamn(e.target.value)}
          className={faltStil}
        />
      </label>

      <label className="flex flex-col gap-1">
        E-post
        <input
          type="email"
          required
          value={epost}
          onChange={(e) => setEpost(e.target.value)}
          className={faltStil}
        />
      </label>

      <label className="flex flex-col gap-1">
        Lösenord (minst 8 tecken)
        <input
          type="password"
          required
          minLength={8}
          value={losenord}
          onChange={(e) => setLosenord(e.target.value)}
          className={faltStil}
        />
      </label>

      {fel && (
        <p role="alert" className="font-medium text-red-400">
          {fel}
        </p>
      )}

      <button
        type="submit"
        className="rounded bg-orange-500 p-2 font-semibold text-black hover:bg-orange-400 focus:outline-none focus:ring-2 focus:ring-white"
      >
        Skapa konto
      </button>
    </form>
  );
}
