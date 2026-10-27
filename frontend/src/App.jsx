import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

import Home from "./pages/Home";
import Screenings from "./pages/Screenings";
import SeatSelection from "./pages/SeatSelection";
import CustomerDetails from "./pages/CustomerDetails.jsx";
import BookingConfirmation from "./pages/BookingConfirmation";

import LoggaIn from "./pages/LoggaIn";
import SkapaKonto from "./pages/SkapaKonto";
import MinaBokningar from "./pages/MinaBokningar";

import Background from "./components/Background";

function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center text-[#EEE7D6]">
      <h1 className="mb-4 text-6xl font-bold text-[#FF8A3D]">
        404
      </h1>

      <h2 className="mb-4 text-2xl font-semibold">
        Sidan kunde inte hittas
      </h2>

      <p className="mb-8 max-w-md text-gray-400">
        Sidan du försöker besöka finns inte eller har flyttats.
      </p>

      <Link
        to="/"
        className="rounded-lg bg-[#FF8A3D] px-6 py-3 font-semibold text-[#070706] transition-colors hover:bg-[#FF9E5C]"
      >
        Tillbaka till startsidan
      </Link>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <main className="relative isolate min-h-screen overflow-hidden bg-[#070706]">
        <Background />

        <Routes>
          {/* Startsida */}
          <Route path="/" element={<Home />} />

          {/* Filmer och platsbokning */}
          <Route path="/screenings" element={<Screenings />} />
          <Route
            path="/screenings/:id/seats"
            element={<SeatSelection />}
          />

          {/* Kunduppgifter och bokningsbekräftelse */}
          <Route
            path="/booking/details"
            element={<CustomerDetails />}
          />
          <Route
            path="/booking/confirmation/:id"
            element={<BookingConfirmation />}
          />

          {/* Användarkonto */}
          <Route path="/logga-in" element={<LoggaIn />} />
          <Route path="/skapa-konto" element={<SkapaKonto />} />
          <Route path="/mina-bokningar" element={<MinaBokningar />} />

          {/* 404 – Okänd adress */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}