import { useState } from "react";

export default function SeatMap({
  seats,
  ticketCount = 0,
  selectedSeats,
  setSelectedSeats,
}) {
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

  function handleSeatClick(seat, rowSeats) {
    if (!seat.isAvailable || ticketCount === 0) return;

    // Klick på en redan vald stol avmarkerar gruppen.
    if (selectedSeats.includes(seat.id)) {
      setSelectedSeats([]);
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

    if (!validGroup) return;

    setSelectedSeats(group.map((currentSeat) => currentSeat.id));
    setHoveredSeats([]);
  }

  return (
    <div className="flex w-full flex-col items-center gap-4 text-[#EEE7D6]">
      <h2 className="text-lg font-semibold">Välj dina platser</h2>

      <div
        className="flex w-full flex-col items-center gap-2.5 sm:gap-3"
        onMouseLeave={() => setHoveredSeats([])}
      >
        {Object.entries(rows).map(([rowNumber, rowSeats]) => (
          <div
            key={rowNumber}
            className="flex w-full items-center justify-center gap-1 sm:gap-2"
          >
            <span className="w-8 shrink-0 text-[10px] sm:w-12 sm:text-sm">
              Rad {rowNumber}
            </span>

            <div className="flex items-center justify-center gap-1 sm:gap-2">
              {rowSeats.map((seat) => {
                const isSelected = selectedSeats.includes(seat.id);
                const isHovered = hoveredSeats.includes(seat.id);

                return (
                  <button
                    key={seat.id}
                    type="button"
                    disabled={!seat.isAvailable}
                    onMouseEnter={() => handleSeatHover(seat, rowSeats)}
                    onClick={() => handleSeatClick(seat, rowSeats)}
                    aria-pressed={isSelected}
                    aria-label={`Rad ${rowNumber}, plats ${seat.seat_number}`}
                    className={`flex aspect-square w-[clamp(18px,5.5vw,36px)] shrink-0 items-center justify-center rounded-t-md text-[10px] transition-colors sm:rounded-t-lg sm:text-sm ${
                      !seat.isAvailable
                        ? "bg-[#E23A1A] text-white"
                        : isSelected || isHovered
                          ? "bg-[#6FAF65] text-[#070706]"
                          : "bg-[#EEE7D6] text-[#070706]"
                    }`}
                  >
                    {seat.seat_number}
                  </button>
                );
              })}
            </div>
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
