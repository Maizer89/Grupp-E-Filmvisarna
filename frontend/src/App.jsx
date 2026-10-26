import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Screenings from "./pages/Screenings";
import SeatSelection from "./pages/SeatSelection";
import Background from "./components/Background";
import LoggaIn from "./pages/LoggaIn";
import SkapaKonto from "./pages/SkapaKonto";
import MinaBokningar from "./pages/MinaBokningar";
import BookingConfirmation from "./pages/BookingConfirmation";
import CustomerDetails from "./pages/CustomerDetails.jsx";

function Home() {
  return (
    <div className="p-8 text-white">
      <h1 className="text-2xl font-bold mb-4">Filmvisarna</h1>
      <Link
        to="/screenings"
        className="inline-block bg-blue-600 px-4 py-2 rounded hover:bg-blue-500 transition"
      >
        Visa filmvisningar
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
          <Route path="/" element={<Home />} />
          <Route path="/screenings" element={<Screenings />} />
          <Route path="/screenings/:id/seats" element={<SeatSelection />} />

          <Route path="/logga-in" element={<LoggaIn />} />
          <Route path="/skapa-konto" element={<SkapaKonto />} />
          <Route path="/mina-bokningar" element={<MinaBokningar />} />
          <Route path="/booking/details" element={<CustomerDetails />} />
          <Route
            path="/booking/confirmation/:id"
            element={<BookingConfirmation />}
          />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
