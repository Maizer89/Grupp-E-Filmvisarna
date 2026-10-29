import SeatMap from "../components/SeatMap.jsx";
import { useNavigate, useParams } from "react-router-dom";
import { useState, useCallback } from "react";
import TicketSelector from "../components/TicketSelector";
import BookingSteps from "../components/Bookingsteps.jsx";
import useSeats from "../hooks/useSeats.js";
import useTicketTypes from "../hooks/useTicketTypes.js";
import useScreening from "../hooks/useScreening.js";
import ScreeningInfo from "../components/ScreeningInfo";

export default function SeatSelection() {
  const { id } = useParams();
  const { ticketTypes } = useTicketTypes();
  const [ticketCounts, setTicketCounts] = useState({});
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [seatConflictMessage, setSeatConflictMessage] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState("");

  // Deselect seats if reserved by another user and display notification (Card 14.4)
  const handleSeatsTaken = useCallback((takenSeatIds) => {
    setSelectedSeats((prevSelected) => {
      const hasConflict = prevSelected.some((seatId) => takenSeatIds.includes(seatId));

      if (hasConflict) {
        setSeatConflictMessage(
          "En eller flera av dina valda platser blev precis reserverade av en annan besökare.",
        );
        return prevSelected.filter((seatId) => !takenSeatIds.includes(seatId));
      }

      return prevSelected;
    });
  }, []);

  const { seats, loading, error } = useSeats(id, handleSeatsTaken);
  const {
    screening,
    loading: screeningLoading,
    error: screeningError,
  } = useScreening(id);

  const navigate = useNavigate();

  async function goToCustomerDetails() {
    if (bookingLoading) return;

    setBookingLoading(true);
    setBookingError("");

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          screeningId: Number(id),
          seats: selectedTickets,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Kunde inte reservera platserna.");
      }

      navigate("/booking/details", {
        state: {
          bookingId: data.bookingId,
          reservedUntil: data.reservedUntil,
          screeningId: id,
          screening,
          seats,
          selectedTickets,
          selectedSeats,
          ticketCounts,
          ticketTypes,
          totalPrice: data.totalPrice,
        },
      });
    } catch (error) {
      setBookingError(error.message);
    } finally {
      setBookingLoading(false);
    }
  }

  function updateTicketCount(ticketTypeId, change) {
    setTicketCounts((prev) => ({
      ...prev,
      [ticketTypeId]: Math.max(0, (prev[ticketTypeId] || 0) + change),
    }));

    setSelectedSeats([]);
  }

  const totalPrice = ticketTypes.reduce((total, ticketType) => {
    const count = ticketCounts[ticketType.id] || 0;

    return total + count * ticketType.price;
  }, 0);

  const totalTickets = Object.values(ticketCounts).reduce(
    (total, count) => total + count,
    0,
  );

  const selectedTickets = [];

  const sortedSelectedSeats = [...selectedSeats].sort((a, b) => a - b);

  let seatIndex = 0;

  ticketTypes.forEach((ticketType) => {
    const count = ticketCounts[ticketType.id] || 0;

    for (let i = 0; i < count; i++) {
      if (seatIndex >= sortedSelectedSeats.length) break;

      selectedTickets.push({
        seatId: sortedSelectedSeats[seatIndex],
        ticketTypeId: ticketType.id,
      });

      seatIndex++;
    }
  });

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

          {/* Seat conflict warning banner (Card 14.4) */}
          {seatConflictMessage && (
            <div className="mx-auto mb-6 flex w-full max-w-[600px] items-center justify-between rounded-lg border border-amber-500/40 bg-amber-500/15 p-4 text-sm text-amber-200">
              <div className="flex items-center gap-2">
                <span>⚠️</span>
                <span>{seatConflictMessage}</span>
              </div>
              <button
                type="button"
                onClick={() => setSeatConflictMessage("")}
                className="ml-3 font-bold text-amber-300 hover:text-white"
              >
                ✕
              </button>
            </div>
          )}

          <SeatMap
            seats={seats}
            ticketCount={totalTickets}
            selectedSeats={selectedSeats}
            setSelectedSeats={setSelectedSeats}
          />

          <div className="mx-auto mt-6 w-full max-w-[600px] rounded-lg bg-[#202026] p-5 text-[#EEE7D6]">
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

          <div className="mx-auto mt-10 flex w-full max-w-[900px] flex-col-reverse justify-between gap-4 px-4 pb-10 sm:flex-row sm:px-0">
            {/* Tillbaka */}
            <button
              type="button"
              className="flex items-center justify-center gap-3 rounded-md border border-[#EEE7D6]/50 bg-[#202026] px-6 py-3 text-[#EEE7D6] transition-colors hover:bg-[#303036]"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M19 12H5M12 19l-7-7 7-7"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Tillbaka
            </button>

            {bookingError && (
              <p role="alert" className="text-sm text-red-400">
                {bookingError}
              </p>
            )}
            {/* Gå vidare */}
            <button
              type="button"
              onClick={goToCustomerDetails}
              disabled={
                bookingLoading ||
                totalTickets === 0 ||
                selectedSeats.length !== totalTickets
              }
              className="flex items-center justify-center gap-3 rounded-md bg-[#FF893C] px-6 py-3 font-medium text-[#070706] transition-colors hover:bg-[#FF9E5C] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {bookingLoading ? "Reserverar platser..." : "Gå vidare"}

              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M5 12h14m-7-7 7 7-7 7"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
