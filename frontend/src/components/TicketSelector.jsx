export default function TicketSelector({
  ticketTypes,
  ticketCounts,
  updateTicketCount,
}) {
  return (
    <div className="mx-auto mb-8 w-full max-w-[600px] rounded-lg bg-[#141416] p-5 text-[#EEE7D6]">
      <h2 className="mb-4 text-base font-semibold">Välj antal biljetter</h2>

      <div className="flex flex-col gap-3">
        {ticketTypes.map((ticketType) => (
          <div
            key={ticketType.id}
            className="flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <p className="text-sm font-medium">{ticketType.name}</p>
              <p className="text-xs text-[#C8A96B]">{ticketType.price} kr</p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => updateTicketCount(ticketType.id, -1)}
                disabled={!ticketCounts[ticketType.id]}
                aria-label={`Minska antal ${ticketType.name}`}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-[#303034] text-[#EEE7D6] disabled:opacity-30"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M5 12h14"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>

              <span className="w-4 text-center text-sm font-medium">
                {ticketCounts[ticketType.id] || 0}
              </span>

              <button
                type="button"
                onClick={() => updateTicketCount(ticketType.id, 1)}
                aria-label={`Öka antal ${ticketType.name}`}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-[#FF893C] text-[#070706]"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
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
