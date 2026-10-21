export default function SeatMap({ seats }) {
  const rows = Object.groupBy(seats, (seat) => seat.row_number);

  return (
    <div className="flex flex-col items-center gap-4">
      <h2>Välj dina platser</h2>

      {Object.entries(rows).map(([rowNumber, rowSeats]) => (
        <div key={rowNumber} className="flex items-center justify-center gap-2">
          <span>Rad {rowNumber}</span>

          {rowSeats.map((seat) => (
            <button
              key={seat.id}
              type="button"
              className={`w-9 h-9 rounded-t-lg text-sm ${
                seat.isAvailable
                  ? "bg-[#EEE7D6] text-[#070706]"
                  : "bg-[#E23A1A] text-white"
              }`}
            >
              {seat.seat_number}
            </button>
          ))}
        </div>
      ))}

      <div className="mt-5 flex items-center justify-center gap-6 text-base">
        <div className="flex items-center gap-2">
          <span className="h-6 w-6 rounded-t bg-[#EEE7D6]"></span>
          <span>Ledig</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="h-6 w-6 rounded-t bg-[#6FAF65]"></span>
          <span>Vald</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="h-6 w-6 rounded-t bg-[#E23A1A]"></span>
          <span>Upptagen</span>
        </div>
      </div>
    </div>
  );
}
