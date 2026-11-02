import { useEffect, useState } from "react";
import AgeRatingFilter from "../components/AgeRatingFilter";

export default function Screenings() {
  const [date, setDate] = useState("2026-10-15");
  const [ageRating, setAgeRating] = useState("all");
  const [screenings, setScreenings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!date) return;

    let isMounted = true;

    async function fetchScreenings() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`/api/screenings?date=${date}`);

        if (!res.ok) {
          throw new Error("Kunde inte hämta visningar");
        }

        const data = await res.json();

        if (isMounted) {
          setScreenings(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchScreenings();

    return () => {
      isMounted = false;
    };
  }, [date]);

  // US 12: Filtrera visningar efter filmens åldersgräns.
  // Filmer utan angiven åldersgräns visas inte
  // när ett åldersfilter är valt.

  const filteredScreenings = screenings.filter((screening) => {
    if (ageRating === "all") {
      return true;
    }

    if (
      screening.age_limit == null ||
      screening.age_limit === ""
    ) {
      return false;
    }

    const rating = Number(screening.age_limit);

    return (
      Number.isFinite(rating) &&
      rating <= Number(ageRating)
    );
  });

  const formatTime = (isoString) => {
    const d = new Date(isoString);

    return d.toLocaleTimeString("sv-SE", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 text-white">

      <h1 className="text-3xl font-bold mb-6">
        Filtrera visningar
      </h1>

      {/* Datumfilter – US 11 */}

      <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-zinc-900 p-4 rounded-lg">

        <label
          htmlFor="screening-date"
          className="font-medium text-zinc-300"
        >
          Välj datum:
        </label>

        <input
          id="screening-date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="bg-zinc-800 text-white px-3 py-2 rounded border border-zinc-700 focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Åldersfilter – US 12 */}

      <div className="mb-8 rounded-lg bg-zinc-900 p-4">
        <AgeRatingFilter
          value={ageRating}
          onChange={setAgeRating}
        />
      </div>

      {/* Laddning och felmeddelanden */}

      {loading && (
        <p className="text-zinc-400">
          Hämtar visningar...
        </p>
      )}

      {error && (
        <p className="text-red-500">
          Fel: {error}
        </p>
      )}

      {!loading &&
        !error &&
        screenings.length === 0 && (
          <p className="text-zinc-400">
            Inga visningar hittades för valt datum.
          </p>
        )}

      {!loading &&
        !error &&
        screenings.length > 0 &&
        filteredScreenings.length === 0 && (
          <p
            className="text-zinc-400"
            role="status"
          >
            Inga filmer matchar den valda
            åldersgränsen för detta datum.
          </p>
        )}

      {/* Filmvisningar */}

      <div className="grid gap-4 sm:grid-cols-2">

        {!loading &&
          !error &&
          filteredScreenings.map((screening) => (

            <div
              key={screening.id}
              className="flex gap-4 bg-zinc-900 p-4 rounded-lg border border-zinc-800"
            >

              <img
                src={screening.poster_url}
                alt={screening.movie_title}
                className="w-20 h-28 object-cover rounded bg-zinc-800"
              />

              <div className="flex flex-col justify-between">

                <div>
                  <h2 className="text-lg font-semibold">
                    {screening.movie_title}
                  </h2>

                  <p className="text-sm text-zinc-400">
                    {screening.auditorium_name}
                  </p>

                  <p className="text-xs text-zinc-500">
                    {screening.duration} min |{" "}
                    {screening.age_limit} år
                  </p>
                </div>

                <span className="text-blue-400 font-bold text-lg">
                  Kl. {formatTime(screening.start_time)}
                </span>

              </div>
            </div>
          ))}
      </div>
    </div>
  );
}