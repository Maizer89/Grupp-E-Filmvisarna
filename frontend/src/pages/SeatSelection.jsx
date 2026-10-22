import SeatMap from "../components/SeatMap.jsx";
import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import TicketSelector from "../components/TicketSelector";
import BookingSteps from "../components/BookingSteps.jsx";
import useSeats from "../hooks/useSeats.js";
import useTicketTypes from "../hooks/useTicketTypes.js";
import useScreening from "../hooks/useScreening.js";
import ScreeningInfo from "../components/ScreeningInfo";

export default function SeatSelection() {
  const { id } = useParams();
  const { ticketTypes } = useTicketTypes();
  const [ticketCounts, setTicketCounts] = useState({});
  const { seats, loading, error } = useSeats(id);
  const {
    screening,
    loading: screeningLoading,
    error: screeningError,
  } = useScreening(id);

  const navigate = useNavigate();

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
      {loading || screeningLoading ? (
        <p>Hämtar visningsinformation...</p>
      ) : error || screeningError ? (
        <p className="text-red-500">{error || screeningError}</p>
      ) : (
        <>
          <BookingSteps currentStep={1} />

          <ScreeningInfo
            screening={screening}
            onSelect={(screeningId) => {
              navigate(`/screenings/${screeningId}/seats`);
            }}
          />

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
                stroke="#FF6685"
                strokeWidth="8"
                strokeLinecap="round"
              />
            </svg>
            <p className="mt-3 text-center text-xs tracking-widest text-[#C8A96B]">
              BIODUK
            </p>
          </div>

          <SeatMap seats={seats} ticketCount={totalTickets} />

          <div className="mx-auto mt-6 w-full max-w-[600px] rounded-lg bg-[#141416] p-5 text-[#EEE7D6]">
            <h2 className="mb-4 text-base font-semibold">Din bokning</h2>

            <div className="flex items-center justify-between text-sm">
              <span className="text-[#EEE7D6]/70">Antal biljetter</span>
              <span className="font-medium">{totalTickets} st</span>
            </div>

            <div className="mt-3 flex items-center justify-between border-t border-[#EEE7D6]/10 pt-3">
              <span className="text-sm font-medium">Totalt pris</span>
              <span className="text-lg font-semibold text-[#FF893C]">
                {totalPrice} kr
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
