import { useEffect, useRef } from "react";

export default function ReservationExpiredModal({ onConfirm }) {
  const buttonRef = useRef(null);

  useEffect(() => {
    buttonRef.current?.focus();

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        event.preventDefault();
      }

      if (event.key === "Tab") {
        event.preventDefault();
        buttonRef.current?.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 px-4 backdrop-blur-[3px]">
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="reservation-expired-title"
        aria-describedby="reservation-expired-description"
        className="w-full max-w-[550px] rounded-xl border border-[#C8A96B]/60 bg-[#171719] px-6 py-12 text-center shadow-2xl sm:px-12"
      >
        <div className="mb-7 flex justify-center">
          <svg
            width="96"
            height="96"
            viewBox="0 0 96 96"
            fill="none"
            aria-hidden="true"
          >
            <circle cx="44" cy="43" r="33" stroke="#FF8A3D" strokeWidth="3.5" />

            <path
              d="M44 23V44L58 54"
              stroke="#FF8A3D"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            <circle cx="74" cy="72" r="17" fill="#FF8A3D" />

            <path
              d="M74 63V73"
              stroke="#171719"
              strokeWidth="3.5"
              strokeLinecap="round"
            />

            <circle cx="74" cy="79" r="2" fill="#171719" />
          </svg>
        </div>

        <h2
          id="reservation-expired-title"
          className="mb-5 font-serif text-3xl font-semibold text-[#EEE7D6]"
        >
          Din reservation har gått ut
        </h2>

        <p
          id="reservation-expired-description"
          className="mb-5 text-base leading-8 text-[#EEE7D6]/75"
        >
          Tiden för att slutföra din bokning har passerat och dina valda platser
          är inte längre reserverade.
        </p>

        <p className="mb-8 text-base text-[#EEE7D6]/80">
          Klicka på OK för att välja nya platser.
        </p>

        <button
          ref={buttonRef}
          type="button"
          onClick={onConfirm}
          className="w-full max-w-[330px] rounded-lg bg-[#FF8A3D] px-6 py-4 text-lg font-semibold text-[#070706] transition-colors hover:bg-[#FF9E5C] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#FF8A3D]"
        >
          OK
        </button>
      </div>
    </div>
  );
}
