import { useState } from "react";
import ScreeningSelector from "./ScreeningSelector";

export default function ScreeningInfo({ screening, onSelect }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mb-10 text-center">
      <div className="flex items-center justify-center gap-4 text-[#EEE7D6]">
        <span>{screening.movie_title}</span>
        <span>|</span>
        <span>
          {new Date(screening.start_time).toLocaleString("sv-SE", {
            timeZone: "Europe/Stockholm",
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
        <span>|</span>
        <span>{screening.auditorium_name}</span>
      </div>

      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="mt-4 rounded bg-[#FF8A3D] px-6 py-2 text-sm text-[#070706]"
      >
        Ändra dag eller tid
      </button>

      {isOpen && (
        <div className="mt-6">
          <ScreeningSelector movieId={screening.movie_id} onSelect={onSelect} />
        </div>
      )}
    </div>
  );
}
