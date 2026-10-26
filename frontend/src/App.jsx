import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Screenings from "./pages/Screenings";
import SeatSelection from "./pages/SeatSelection";
import Background from "./components/Background";
import LoggaIn from "./pages/LoggaIn";
import SkapaKonto from "./pages/SkapaKonto";
import MinaBokningar from "./pages/MinaBokningar";
import BookingConfirmation from "./pages/BookingConfirmation";
import Home from "./pages/Home";


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

          <Route path="/booking/confirmation/:id"
                element={<BookingConfirmation />}
/>
        </Routes>
      </main>
    </BrowserRouter>
  );
}
