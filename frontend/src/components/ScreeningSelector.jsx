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
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          disabled={weekOffset === 0}
          onClick={() => setWeekOffset((prev) => Math.max(0, prev - 1))}
          className="flex items-center gap-3 rounded border border-[#FF8A3D] px-3 py-1 text-sm disabled:cursor-not-allowed disabled:opacity-40"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#FF8A3D"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M20 12H4M11 5l-7 7 7 7" />
          </svg>
          <span>Föregående vecka</span>
        </button>

        <button
          type="button"
          onClick={() => setWeekOffset((prev) => prev + 1)}
          className="flex items-center gap-3 rounded border border-[#FF8A3D] px-3 py-1 text-sm"
        >
          <span>Nästa vecka</span>
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#FF8A3D"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M4 12h16m-7-7 7 7-7 7" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => {
          const dayScreenings = getScreeningsForDay(day);

          return (
            <div
              key={day.toISOString()}
              className="min-h-[208px] rounded-md border border-[#FF8A3D] bg-[#070706] p-1.5"
            >
              <h3 className="mb-1.5 border-b border-[#FF8A3D] pb-2 font-['Roboto_Serif'] text-lg font-bold">
                <span className="text-[#FF8A3D]">
                  {day
                    .toLocaleDateString("sv-SE", { weekday: "short" })
                    .replace(/^./, (char) => char.toUpperCase())}
                </span>{" "}
                <span className="text-[#EEE7D6]">
                  {day.toLocaleDateString("sv-SE", {
                    day: "numeric",
                    month: "short",
                  })}
                </span>
              </h3>

              <div className="space-y-1.5">
                {dayScreenings.length === 0 ? (
                  <p className="text-xs text-[#EEE7D6]">
                    Inga visningar denna dag
                  </p>
                ) : (
                  dayScreenings.map((screening, index) => (
                    <button
                      key={screening.id}
                      type="button"
                      onClick={() => onSelect(screening.id)}
                      className="w-full rounded-md border px-1.5 py-1 text-xs transition-colors hover:bg-[#202026]"
                      style={{
                        borderColor:
                          screeningColors[index % screeningColors.length],
                        color: screeningColors[index % screeningColors.length],
                      }}
                    >
                      <div className="flex items-center justify-between gap-1 text-left">
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

                          <span className="block text-[10px] leading-tight text-[#EEE7D6]">
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
