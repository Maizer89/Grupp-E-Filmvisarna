import { useState, useEffect } from "react";

export default function useScreeningSchedule() {
  const [screenings, setScreenings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchScreenings() {
      try {
        const response = await fetch("/api/screenings");

        if (!response.ok) {
          throw new Error("Kunde inte hämta visningar");
        }

        const data = await response.json();
        setScreenings(data);
      } catch (error) {
        console.error("Fel vid hämtning av visningar:", error);
        setError("Kunde inte hämta visningstiderna.");
      } finally {
        setLoading(false);
      }
    }

    fetchScreenings();
  }, []);

  return { screenings, loading, error };
}
