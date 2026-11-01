// US 12: Åldersfiltrering 

export default function AgeRatingFilter({ value, onChange }) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
      <label
        htmlFor="age-rating-filter"
        className="font-medium text-zinc-300"
      >
        Högsta åldersgräns:
      </label>

      <select
        id="age-rating-filter"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-describedby="age-rating-help"
        className="rounded border border-zinc-700 bg-zinc-800 px-3 py-2 text-white focus:border-[#FF8A3D] focus:outline-none"
      >
        <option value="all">Alla filmer</option>
        <option value="0">Barntillåten (0 år)</option>
        <option value="7">Högst 7 år</option>
        <option value="11">Högst 11 år</option>
        <option value="15">Högst 15 år</option>
      </select>

      <p
        id="age-rating-help"
        className="text-xs text-zinc-400"
      >
        Visar bara filmer med högst den valda åldersgränsen.
      </p>
    </div>
  );
}