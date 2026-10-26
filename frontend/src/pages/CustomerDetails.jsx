import { useLocation, useNavigate } from "react-router-dom";
import BookingSteps from "../components/BookingSteps.jsx";
import { useState } from "react";

export default function CustomerDetails() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState("");

  const [changingSeats, setChangingSeats] = useState(false);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const isFormValid =
    firstName.trim().length > 0 &&
    firstName.trim().length <= 100 &&
    lastName.trim().length > 0 &&
    lastName.trim().length <= 100 &&
    email.trim().length <= 255 &&
    emailRegex.test(email.trim());

  const bookedSeats =
    state?.seats?.filter((seat) => state.selectedSeats.includes(seat.id)) || [];

  async function handleBooking() {
    if (bookingLoading || changingSeats || !isFormValid || !state?.bookingId) {
      return;
    }

    setBookingLoading(true);
    setBookingError("");

    try {
      const response = await fetch(`/api/bookings/${state.bookingId}/confirm`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Kunde inte bekräfta bokningen.");
      }

      navigate(`/booking/confirmation/${data.bookingId}`, {
        replace: true,
      });
    } catch (error) {
      setBookingError(error.message);
    } finally {
      setBookingLoading(false);
    }
  }

  async function handleChangeSeats() {
    if (bookingLoading || changingSeats || !state?.bookingId) {
      return;
    }

    setChangingSeats(true);
    setBookingError("");

    try {
      const response = await fetch(
        `/api/bookings/${state.bookingId}/reservation`,
        {
          method: "DELETE",
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Kunde inte avbryta reservationen.");
      }

      navigate(`/screenings/${state.screeningId}/seats`, {
        replace: true,
      });
    } catch (error) {
      setBookingError(error.message);
    } finally {
      setChangingSeats(false);
    }
  }

  if (!state?.bookingId) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-8 text-[#EEE7D6]">
        <p>Ingen bokningsinformation hittades.</p>
        <button
          type="button"
          onClick={() => navigate("/")}
          className="mt-4 rounded-md bg-[#FF8A3D] px-5 py-3 text-black"
        >
          Tillbaka till startsidan
        </button>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-8 text-[#EEE7D6]">
      <BookingSteps currentStep={2} />

      <h1 className="mb-2 text-3xl font-semibold">Dina uppgifter</h1>
      <p className="mb-8 text-[#C8A96B]">Snart är dina platser bokade.</p>

      <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-2">
        <section className="rounded-xl border border-[#303036] bg-[#171719] p-5">
          <h2 className="mb-2 text-xl font-semibold">Vem gäller bokningen?</h2>

          <p className="mb-2 text-sm text-[#EEE7D6]/70">
            Vi skickar bokningsbekräftelsen till din e-post.
          </p>

          <p className="mb-6 text-xs text-[#EEE7D6]/60">* Obligatoriska fält</p>

          <div className="space-y-4">
            <div>
              <label htmlFor="firstName" className="mb-2 block text-sm">
                Förnamn *
              </label>
              <input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                maxLength={100}
                autoComplete="given-name"
                placeholder="Ditt förnamn"
                className="w-full rounded-md border border-[#555560] bg-[#202026] px-3 py-3 text-[#EEE7D6]"
              />
            </div>

            <div>
              <label htmlFor="lastName" className="mb-2 block text-sm">
                Efternamn *
              </label>
              <input
                id="lastName"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                maxLength={100}
                autoComplete="family-name"
                placeholder="Ditt efternamn"
                className="w-full rounded-md border border-[#555560] bg-[#202026] px-3 py-3 text-[#EEE7D6]"
              />
            </div>

            <div>
              <label htmlFor="email" className="mb-2 block text-sm">
                E-post *
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                maxLength={255}
                autoComplete="email"
                placeholder="namn@exempel.se"
                className="w-full rounded-md border border-[#555560] bg-[#202026] px-3 py-3 text-[#EEE7D6]"
              />

              <p className="mt-2 text-xs text-[#EEE7D6]/60">
                Kontrollera att e-postadressen är rätt innan du bokar.
              </p>
            </div>
          </div>

          <p className="mt-6 border-t border-[#303036] pt-4 text-xs text-[#C8A96B]">
            Du betalar dina biljetter på biografen.
          </p>
        </section>

        <aside className="space-y-4">
          <section className="rounded-xl border border-[#303036] bg-[#202026] p-5 text-[#EEE7D6]">
            <h2 className="mb-4 border-l-2 border-[#FF8A3D] pl-3 text-xl">
              Din bokning
            </h2>

            <h3 className="mb-2 text-lg font-semibold">
              {state.screening.movie_title}
            </h3>

            <p className="mb-2 text-sm">
              {new Intl.DateTimeFormat("sv-SE", {
                timeZone: "Europe/Stockholm",
                dateStyle: "long",
                timeStyle: "short",
              }).format(new Date(state.screening.start_time))}
            </p>

            <div className="mb-5 border-b border-[#EEE7D6]/10 pb-4 text-sm text-[#EEE7D6]/70">
              <p>Salong: {state.screening.auditorium_name}</p>

              <p className="mt-2">
                Platser:{" "}
                {bookedSeats
                  .map(
                    (seat) =>
                      `Rad ${seat.row_number}, stol ${seat.seat_number}`,
                  )
                  .join(" · ")}
              </p>
            </div>

            <div className="mb-5 space-y-2 border-b border-[#EEE7D6]/10 pb-4 text-sm">
              {state.ticketTypes.map((ticketType) => {
                const count = state.ticketCounts[ticketType.id] || 0;

                if (count === 0) return null;

                return (
                  <div
                    key={ticketType.id}
                    className="flex items-center justify-between"
                  >
                    <span>
                      {count} × {ticketType.name}
                    </span>

                    <span>{count * ticketType.price} kr</span>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between">
              <span>Totalt</span>
              <span className="text-xl font-bold">{state.totalPrice} kr</span>
            </div>

            <p className="mt-3 text-xs text-[#C8A96B]">Betalas på biografen</p>
          </section>

          <p className="text-xs text-[#EEE7D6]/70">
            När du väljer ”Boka biljetter” slutförs din bokning. Ingen betalning
            görs online.
          </p>

          {bookingError && (
            <p role="alert" className="text-sm text-red-400">
              {bookingError}
            </p>
          )}

          <button
            type="button"
            onClick={handleBooking}
            disabled={!isFormValid || bookingLoading || changingSeats}
            className="w-full rounded-md bg-[#FF8A3D] px-5 py-3 font-semibold text-[#070706] hover:bg-[#FF9E5C] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {bookingLoading ? "Bekräftar bokning..." : "Boka biljetter →"}
          </button>

          <button
            type="button"
            onClick={handleChangeSeats}
            disabled={bookingLoading || changingSeats}
            className="w-full rounded-md border border-[#EEE7D6]/50 px-5 py-3 text-[#EEE7D6] hover:bg-[#202026] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {changingSeats ? "Frigör platser..." : "← Ändra platser"}
          </button>
        </aside>
      </div>
    </main>
  );
}
