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
              className="w-9 h-9 rounded-t-lg bg-[#202026] text-[#EEE7D6] text-sm"
            >
              {seat.seat_number}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}
