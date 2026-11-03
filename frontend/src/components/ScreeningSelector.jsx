import { useState } from "react";
import useScreeningSchedule from "../hooks/useScreeningSchedule";

export default function ScreeningSelector({ movieId, onSelect }) {
  const [weekOffset, setWeekOffset] = useState(0);
  const { screenings, loading, error } = useScreeningSchedule();

  const movieScreenings = screenings.filter(
    (screening) => screening.movie_id === Number(movieId),
  );

  const getScreeningsForDay = (day) => {
    const dayDate = day.toLocaleDateString("sv-SE");
    const now = new Date();

    return movieScreenings.filter((screening) => {
      const screeningStart = new Date(screening.start_time);

      const screeningDate = screeningStart.toLocaleDateString("sv-SE", {
        timeZone: "Europe/Stockholm",
      });

      return screeningDate === dayDate && screeningStart > now;
    });
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay() + 1 + weekOffset * 7);

  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + index);
    return date;
  });

  const screeningColors = ["#C8A96B", "#FF6685"];

  return (
    <div className="w-full font-['Roboto'] text-[#EEE7D6]">
      {/* Veckonavigering */}
      <div className="mb-4 flex items-center justify-between gap-2">
        <button
          type="button"
          disabled={weekOffset === 0}
          onClick={() => setWeekOffset((prev) => Math.max(0, prev - 1))}
          className="flex items-center gap-2 rounded border border-[#FF8A3D] px-2 py-2 text-xs transition-colors hover:bg-[#202026] disabled:cursor-not-allowed disabled:opacity-40 sm:gap-3 sm:px-3 sm:py-1 sm:text-sm"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#FF8A3D"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className="shrink-0"
          >
            <path d="M20 12H4M11 5l-7 7 7 7" />
          </svg>
          <span>Föregående vecka</span>
        </button>

        <button
          type="button"
          onClick={() => setWeekOffset((prev) => prev + 1)}
          className="flex items-center gap-2 rounded border border-[#FF8A3D] px-2 py-2 text-xs transition-colors hover:bg-[#202026] sm:gap-3 sm:px-3 sm:py-1 sm:text-sm"
        >
          <span>Nästa vecka</span>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#FF8A3D"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className="shrink-0"
          >
            <path d="M4 12h16m-7-7 7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Datumkort */}
      <div className="grid grid-cols-1 gap-3 pb-3 md:grid-cols-7 md:gap-2">
        {days.map((day) => {
          const dayScreenings = getScreeningsForDay(day);

          return (
            <div
              key={day.toISOString()}
              className="min-w-0 rounded-md border border-[#FF8A3D] bg-[#070706] p-3 md:min-h-[208px] md:p-1.5"
            >
              {/* Datum */}
              <h3 className="mb-3 border-b border-[#FF8A3D] pb-2 font-['Roboto_Serif'] text-base font-bold md:mb-1.5 md:whitespace-nowrap md:text-sm">
                <span className="text-[#FF8A3D]">
                  <span className="md:hidden">
                    {day
                      .toLocaleDateString("sv-SE", { weekday: "long" })
                      .replace(/^./, (char) => char.toUpperCase())}
                  </span>

                  <span className="hidden md:inline">
                    {day
                      .toLocaleDateString("sv-SE", { weekday: "short" })
                      .replace(/^./, (char) => char.toUpperCase())}
                  </span>
                </span>{" "}
                <span className="text-[#EEE7D6]">
                  {day.toLocaleDateString("sv-SE", {
                    day: "numeric",
                    month: "long",
                  })}
                </span>
              </h3>

              {/* Visningstider */}
              <div className="grid grid-cols-3 gap-2 md:block md:space-y-1.5">
                {dayScreenings.length === 0 ? (
                  <p className="text-sm text-[#EEE7D6]/70 md:text-xs">
                    Inga visningar denna dag
                  </p>
                ) : (
                  dayScreenings.map((screening, index) => (
                    <button
                      key={screening.id}
                      type="button"
                      onClick={() => onSelect(screening.id)}
                      className="min-w-0 rounded-md border px-1.5 py-2 text-xs transition-colors hover:bg-[#202026] md:w-full md:py-1"
                      style={{
                        borderColor:
                          screeningColors[index % screeningColors.length],
                        color: screeningColors[index % screeningColors.length],
                      }}
                    >
                      <div className="flex items-center justify-between gap-3 text-left md:gap-1">
                        <div>
                          <span className="block text-base font-bold leading-tight">
                            {new Date(screening.start_time).toLocaleTimeString(
                              "sv-SE",
                              {
                                timeZone: "Europe/Stockholm",
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
                          </span>

                          <span className="block text-xs leading-tight text-[#EEE7D6] md:text-[10px]">
                            {screening.auditorium_name}
                          </span>
                        </div>

                        <span className="text-lg">›</span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
