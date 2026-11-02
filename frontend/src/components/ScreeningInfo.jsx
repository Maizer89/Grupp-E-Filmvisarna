export default function ScreeningInfo({ screening, onToggleSchedule }) {
  const date = new Date(screening.start_time);

  const formattedDate = date.toLocaleDateString("sv-SE", {
    timeZone: "Europe/Stockholm",
    day: "numeric",
    month: "long",
  });

  const formattedTime = date.toLocaleTimeString("sv-SE", {
    timeZone: "Europe/Stockholm",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <section className="w-full text-[#EEE7D6]">
      <h2 className="mb-5 text-lg font-semibold">Vald film</h2>

      <div className="flex flex-col gap-5 sm:flex-row">
        <img
          src={screening.poster_url}
          alt={`Affisch för ${screening.movie_title}`}
          className="h-48 w-32 shrink-0 rounded-lg object-cover"
        />

        <div className="flex flex-1 flex-col">
          <h3 className="mb-4 text-xl font-bold text-[#FF8A3D]">
            {screening.movie_title}
          </h3>

          <div className="space-y-3 text-sm">
            <p>
              📅 {formattedDate} kl. {formattedTime}
            </p>

            <p>📍 {screening.auditorium_name}</p>

            <p className="text-[#EEE7D6]/70">
              {screening.duration} min | Från {screening.age_limit} år
            </p>
          </div>

          <button
            type="button"
            onClick={onToggleSchedule}
            className="mt-5 self-start rounded-lg border border-[#FF8A3D] px-4 py-2 text-sm font-medium text-[#FF8A3D] transition-colors hover:bg-[#FF8A3D] hover:text-[#070706]"
          >
            Ändra dag eller tid
          </button>
        </div>
      </div>
    </section>
  );
}
