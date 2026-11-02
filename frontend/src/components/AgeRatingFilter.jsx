// US 12 – Åldersfiltrering

export default function AgeRatingFilter({
  value,
  onChange,
  id = "age-rating-filter",
  compact = false,
}) {
  return (
    <div
      className={
        compact
          ? "min-w-0"
          : "flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4"
      }
    >
      <label
        htmlFor={id}
        className={
          compact
            ? "mb-3 block text-xs font-semibold uppercase tracking-[0.15em] text-[#C8A96B]"
            : "font-medium text-zinc-300"
        }
      >
        {compact ? "02 / Åldersgräns" : "Högsta åldersgräns:"}
      </label>

      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-describedby={compact ? undefined : `${id}-help`}
        className={
          compact
            ? "min-h-11 w-full rounded-lg border border-[#C8A96B]/40 bg-[#202026] px-4 py-2 text-sm text-[#EEE7D6] outline-none focus:border-[#FF8A3D]"
            : "rounded border border-zinc-700 bg-zinc-800 px-3 py-2 text-white focus:border-[#FF8A3D] focus:outline-none"
        }
      >
        <option value="all">Alla filmer</option>
        <option value="0">Barntillåten (0 år)</option>
        <option value="7">Högst 7 år</option>
        <option value="11">Högst 11 år</option>
        <option value="15">Högst 15 år</option>
      </select>

      {!compact && (
        <p
          id={`${id}-help`}
          className="text-xs text-zinc-400"
        >
          Visar bara filmer med högst den valda åldersgränsen.
        </p>
      )}
    </div>
  );
}