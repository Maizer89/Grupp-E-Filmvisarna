import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import BookingSteps from "../components/Bookingsteps.jsx";

export default function BookingConfirmation() {
  const { id } = useParams();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function fetchBooking() {
      setLoading(true);
      setError("");
      setBooking(null);

      try {
        const response = await fetch(
          `/api/bookings/${encodeURIComponent(id)}/confirmation`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error(
            response.status === 404
              ? "Ingen bekräftad bokning hittades."
              : "Kunde inte hämta bokningsbekräftelsen."
          );
        }

        const data = await response.json();

        if (!controller.signal.aborted) {
          setBooking(data);
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(
            err instanceof Error
              ? err.message
              : "Ett oväntat fel uppstod."
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchBooking();

    return () => controller.abort();
  }, [id]);

  // Laddar bokningsinformationen
  if (loading) {
    return (
      <main className="p-8 text-center text-[#EEE7D6]">
        <p>Hämtar bokningsbekräftelse...</p>
      </main>
    );
  }

  // Visar felmeddelande om bokningen inte hittas
  if (error) {
    return (
      <main className="p-8 text-center text-[#EEE7D6]">
        <h1 className="mb-4 text-2xl font-bold">
          Bokningsbekräftelse
        </h1>

        <p role="alert" className="text-red-400">
          {error}
        </p>
      </main>
    );
  }

  if (!booking) return null;

  // Formatera datum och tid enligt svensk standard
  const date = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Stockholm",
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(booking.startTime));

  return (
    <main className="mx-auto max-w-2xl p-4 py-10 text-[#EEE7D6] sm:p-8">

      {/* Bokningssteg – steg 3 */}
      <BookingSteps currentStep={3} />

      <div className="rounded-xl bg-[#202026] p-6 shadow-lg sm:p-8">

        {/* Rubrik */}
        <h1 className="mb-3 text-center text-3xl font-bold text-[#FF8A3D]">
          Bokningen är bekräftad!
        </h1>

        <p className="mb-8 text-center text-sm text-gray-300">
          Tack för din bokning! Här hittar du dina biljetter
          och ditt bokningsnummer.
        </p>

        <div className="space-y-6">

          {/* Film */}
          <div>
            <h2 className="font-semibold text-[#C8A96B]">
              Film
            </h2>

            <p className="mt-1 text-lg">
              {booking.movie}
            </p>
          </div>

          {/* Datum och tid */}
          <div>
            <h2 className="font-semibold text-[#C8A96B]">
              Datum och tid
            </h2>

            <p className="mt-1">
              {date}
            </p>
          </div>

          {/* Salong */}
          <div>
            <h2 className="font-semibold text-[#C8A96B]">
              Salong
            </h2>

            <p className="mt-1">
              {booking.auditorium}
            </p>
          </div>

          {/* Antal biljetter */}
          <div>
            <h2 className="font-semibold text-[#C8A96B]">
              Antal biljetter
            </h2>

            <p className="mt-1">
              {booking.seats.length} st
            </p>
          </div>

          {/* Valda stolar */}
          <div>
            <h2 className="mb-3 font-semibold text-[#C8A96B]">
              Dina platser
            </h2>

            <div className="flex flex-wrap gap-2">
              {booking.seats.map((seat) => (
                <span
                  key={`${seat.rowNumber}-${seat.seatNumber}`}
                  className="rounded-lg border border-[#C8A96B] bg-[#070706] px-4 py-2 text-sm"
                >
                  Rad {seat.rowNumber}, stol {seat.seatNumber}
                </span>
              ))}
            </div>
          </div>

          {/* Bokningsnummer */}
          <div className="border-t border-gray-600 pt-6">
            <h2 className="mb-2 font-semibold text-[#C8A96B]">
              Bokningsnummer
            </h2>

            <p className="break-all rounded-lg bg-[#070706] p-3 text-sm">
              {booking.bookingNumber}
            </p>
          </div>

          {/* QR-kod */}
          <div className="flex flex-col items-center border-t border-gray-600 pt-6">

            <h2 className="mb-4 text-lg font-semibold text-[#C8A96B]">
              Din QR-kod
            </h2>

            <div className="rounded-xl bg-white p-4">
              <QRCodeSVG
                value={booking.bookingNumber}
                size={200}
                level="M"
                title="QR-kod för din bokning"
              />
            </div>

            <p className="mt-4 max-w-sm text-center text-sm text-gray-300">
              Visa upp QR-koden eller ditt bokningsnummer
              vid ditt besök på biografen.
            </p>

          </div>

          {/* Tillbaka till startsidan */}
          <div className="border-t border-gray-600 pt-6 text-center">
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-lg bg-[#FF8A3D] px-8 py-3 font-semibold text-[#070706] transition-all duration-200 hover:bg-[#FF9E5C] hover:shadow-lg"
            >
              Tillbaka till startsidan
            </Link>
          </div>

        </div>
      </div>
    </main>
  );
}