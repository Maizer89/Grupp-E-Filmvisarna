export default function TicketSelector({
  ticketTypes,
  ticketCounts,
  updateTicketCount,
}) {
  return (
    <div className="mb-8 rounded-xl bg-[#202026] p-6 text-[#EEE7D6]">
      <h2 className="mb-6 text-xl font-bold">Välj antal biljetter</h2>

      <div className="flex flex-col gap-5">
        {ticketTypes.map((ticketType) => (
          <div
            key={ticketType.id}
            className="flex items-center justify-between gap-4"
          >
            <div>
              <p className="font-semibold">{ticketType.name}</p>
              <p className="text-sm text-[#C8A96B]">{ticketType.price} kr</p>
            </div>

            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => updateTicketCount(ticketType.id, -1)}
                disabled={!ticketCounts[ticketType.id]}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#EEE7D6] text-xl text-[#070706] disabled:opacity-30"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M5 12h14"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>

              <span className="w-5 text-center font-bold">
                {ticketCounts[ticketType.id] || 0}
              </span>

              <button
                type="button"
                onClick={() => updateTicketCount(ticketType.id, 1)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#6FAF65] text-xl text-[#070706]"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 5v14M5 12h14"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
