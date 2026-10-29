import { useState, useEffect, useCallback } from "react";

export default function useSeats(id) {
  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSeats = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/screenings/${id}/seats`);

      if (!response.ok) {
        throw new Error("Kunde inte hämta stolar");
      }

      const data = await response.json();
      setSeats(data);
    } catch (error) {
      console.error("Fel vid hämtning av stolar:", error);
      setError("Kunde inte hämta stolarna. Försök igen senare.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchSeats();
  }, [fetchSeats]);

  return { seats, loading, error, fetchSeats };
}
