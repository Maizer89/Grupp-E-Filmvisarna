import { useState, useEffect } from "react";

export default function useScreening(id) {
  const [screening, setScreening] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchScreening() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/screenings/${id}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Kunde inte hämta visningen");
        }

        const data = await response.json();
        setScreening(data);
      } catch (error) {
        if (error.name === "AbortError") return;

        console.error("Fel vid hämtning av visning:", error);
        setError("Kunde inte hämta visningsinformationen.");
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchScreening();

    return () => controller.abort();
  }, [id]);

  return { screening, loading, error };
}
