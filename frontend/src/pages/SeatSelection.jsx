import SeatMap from "../components/SeatMap.jsx";
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import TicketSelector from "../components/TicketSelector";

export default function SeatSelection() {
  const { id } = useParams();
  const [seats, setSeats] = useState([]);
  const [ticketTypes, setTicketTypes] = useState([]);
  const [ticketCounts, setTicketCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchSeats() {
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
    }

    fetchSeats();
  }, [id]);

  useEffect(() => {
    async function fetchTicketTypes() {
      try {
        const response = await fetch("/api/ticket-types");

        if (!response.ok) {
          throw new Error("Kunde inte hämta biljettyper");
        }

        const data = await response.json();
        setTicketTypes(data);
      } catch (error) {
        console.error("Fel vid hämtning av biljettyper:", error);
      }
    }

    fetchTicketTypes();
  }, []);

  function updateTicketCount(ticketTypeId, change) {
    setTicketCounts((prev) => ({
      ...prev,
      [ticketTypeId]: Math.max(0, (prev[ticketTypeId] || 0) + change),
    }));
  }

  const totalPrice = ticketTypes.reduce((total, ticketType) => {
    const count = ticketCounts[ticketType.id] || 0;

    return total + count * ticketType.price;
  }, 0);

  return (
    <div className="p-8 text-white">
      {loading ? (
        <p>Hämtar stolar...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <>
          <SeatMap seats={seats} />

          <TicketSelector
            ticketTypes={ticketTypes}
            ticketCounts={ticketCounts}
            updateTicketCount={updateTicketCount}
          />
        </>
      )}
    </div>
  );
}
