import SeatMap from "../components/SeatMap.jsx";
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";

export default function SeatSelection() {
  const { id } = useParams();
  const [seats, setSeats] = useState([]);

  useEffect(() => {
    async function fetchSeats() {
      try {
        const response = await fetch(`/api/screenings/${id}/seats`);

        if (!response.ok) {
          throw new Error("Kunde inte hämta stolar");
        }

        const data = await response.json();
        setSeats(data);
      } catch (error) {
        console.error("Fel vid hämtning av stolar:", error);
      }
    }

    fetchSeats();
  }, [id]);

  return (
    <div className="p-8 text-white">
      <SeatMap seats={seats} />
    </div>
  );
}
