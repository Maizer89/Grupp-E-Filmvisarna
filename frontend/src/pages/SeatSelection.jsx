import SeatMap from "../components/SeatMap.jsx";
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import TicketSelector from "../components/TicketSelector";
import BookingSteps from "../components/BookingSteps.jsx";
import useSeats from "../hooks/useSeats.js";

export default function SeatSelection() {
  const { id } = useParams();
  const [ticketTypes, setTicketTypes] = useState([]);
  const [ticketCounts, setTicketCounts] = useState({});
  const { seats, loading, error } = useSeats(id);

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

  const totalTickets = Object.values(ticketCounts).reduce(
    (total, count) => total + count,
    0,
  );

  return (
    <div className="mx-auto max-w-5xl px-6 py-8 text-white">
      {loading ? (
        <p>Hämtar stolar...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <>
          <BookingSteps currentStep={1} />

          <TicketSelector
            ticketTypes={ticketTypes}
            ticketCounts={ticketCounts}
            updateTicketCount={updateTicketCount}
          />

          <div className="mb-12 mt-10">
            <svg
              viewBox="0 0 600 40"
              className="mx-auto h-10 w-full max-w-[550px]"
              preserveAspectRatio="none"
            >
              <path
                d="M 5 30 Q 300 5 595 30"
                fill="none"
                stroke="#FF8A3D"
                strokeWidth="8"
                strokeLinecap="round"
              />
            </svg>
            <p className="mt-3 text-center text-xs tracking-widest text-[#C8A96B]">
              BIODUK
            </p>
          </div>

          <SeatMap seats={seats} />

          <div className="mt-8 rounded-xl bg-[#202026] p-6 text-[#EEE7D6]">
            <h2 className="mb-6 text-xl font-bold">Din bokning</h2>

            <div className="flex items-center justify-between">
              <span>Antal biljetter</span>
              <span className="font-semibold">{totalTickets} st</span>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-[#EEE7D6]/20 pt-4">
              <span className="font-semibold">Totalt pris</span>
              <span className="text-xl font-bold text-[#6FAF65]">
                {totalPrice} kr
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
