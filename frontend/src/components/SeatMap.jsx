import { useState } from "react";

export default function SeatMap({ seats, ticketCount = 0 }) {
  const [hoveredSeats, setHoveredSeats] = useState([]);

  const rows = Object.groupBy(seats, (seat) => seat.row_number);

  function handleSeatHover(seat, rowSeats) {
    if (!seat.isAvailable || ticketCount === 0) {
      setHoveredSeats([]);
      return;
    }

    const sortedSeats = [...rowSeats].sort(
      (a, b) => a.seat_number - b.seat_number,
    );

    const hoveredIndex = sortedSeats.findIndex(
      (currentSeat) => currentSeat.id === seat.id,
    );

    const seatsToLeft = Math.floor((ticketCount - 1) / 2);
    const startIndex = hoveredIndex - seatsToLeft;

    const group = sortedSeats.slice(startIndex, startIndex + ticketCount);

    const validGroup =
      startIndex >= 0 &&
      group.length === ticketCount &&
      group.every(
        (currentSeat, index) =>
          currentSeat.isAvailable &&
          currentSeat.seat_number === group[0].seat_number + index,
      );

    setHoveredSeats(validGroup ? group.map((s) => s.id) : []);
  }

  return (
    <div className="flex flex-col items-center gap-4 text-[#EEE7D6]">
      <h2 className="text-lg font-semibold">Välj dina platser</h2>

      <div
        className="flex w-full flex-col items-center gap-3 overflow-x-auto"
        onMouseLeave={() => setHoveredSeats([])}
      >
        {Object.entries(rows).map(([rowNumber, rowSeats]) => (
          <div
            key={rowNumber}
            className="flex items-center justify-center gap-1.5 sm:gap-2"
          >
            <span className="w-12 shrink-0 text-xs sm:text-sm">
              Rad {rowNumber}
            </span>

            {rowSeats.map((seat) => {
              const isHovered = hoveredSeats.includes(seat.id);

              return (
                <button
                  key={seat.id}
                  type="button"
                  disabled={!seat.isAvailable}
                  onMouseEnter={() => handleSeatHover(seat, rowSeats)}
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-t-md text-xs transition-colors sm:h-9 sm:w-9 sm:rounded-t-lg sm:text-sm ${
                    !seat.isAvailable
                      ? "bg-[#E23A1A] text-white"
                      : isHovered
                        ? "bg-[#6FAF65] text-[#070706]"
                        : "bg-[#EEE7D6] text-[#070706]"
                  }`}
                >
                  {seat.seat_number}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-center gap-4 text-sm sm:gap-6">
        <div className="flex items-center gap-2">
          <span className="h-5 w-5 rounded-t bg-[#EEE7D6]" />
          <span>Ledig</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="h-5 w-5 rounded-t bg-[#6FAF65]" />
          <span>Vald</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="h-5 w-5 rounded-t bg-[#E23A1A]" />
          <span>Upptagen</span>
        </div>
      </div>
    </div>
  );
}
