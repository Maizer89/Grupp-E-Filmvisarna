import { useState } from "react";
import { loggaIn } from "../api";

// USER  17: logga in.
// Använd: <LoggaIn vidInloggad={(anvandare) => navigate('/mina-bokningar')} />

// Mörkt kort med vit text, så att texten syns tydligt oavsett vad som finns i bakgrundsbilden
const kort =
  "mx-auto my-8 max-w-sm rounded-lg bg-black/75 p-6 text-white shadow-lg backdrop-blur-sm";
const faltStil =
  "rounded border border-gray-300 bg-white p-2 text-black focus:outline-none focus:ring-2 focus:ring-orange-500";

export default function LoggaIn({ vidInloggad }) {
  const [epost, setEpost] = useState("");
  const [losenord, setLosenord] = useState("");
  const [fel, setFel] = useState("");

  async function skicka(e) {
    e.preventDefault();
    setFel("");
    try {
      const anvandare = await loggaIn(epost, losenord);
      if (vidInloggad) vidInloggad(anvandare);
    } catch (err) {
      setFel(err.message);
    }
  }

  return (
    <form onSubmit={skicka} className={`${kort} flex flex-col gap-4`}>
      <h1 className="text-2xl font-bold">Logga in</h1>

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
        Lösenord
        <input
          type="password"
          required
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
        Logga in
      </button>
    </form>
  );
}
