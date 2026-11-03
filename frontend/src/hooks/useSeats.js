import { useState, useEffect, useCallback } from "react";
import { io } from "socket.io-client";

export default function useSeats(id, onSeatsTaken) {
  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSeats = useCallback(
    async (showLoading = true) => {
      if (!id) return;

      if (showLoading) {
        setLoading(true);
      }

      setError(null);

      try {
        const response = await fetch(`/api/screenings/${id}/seats`);

        if (!response.ok) {
          throw new Error("Kunde inte hämta stolar");
        }

        const data = await response.json();
        setSeats(data);
      } catch (err) {
        console.error("Fel vid hämtning av stolar:", err);
        setError("Kunde inte hämta stolarna. Försök igen senare.");
      } finally {
        setLoading(false);
      }
    },
    [id],
  );

  useEffect(() => {
    fetchSeats();

    // Anslut till Socket.IO
    const socket = io();

    // Anslut till rätt visning
    socket.emit("join_screening", id);

    // Lyssna efter uppdateringar av stolar
    socket.on("seat_status_changed", (data) => {
      console.log("Socket.IO seat_status_changed:", data);
      if (data?.seatIds && data.seatIds.length > 0) {
        setSeats((prevSeats) =>
          prevSeats.map((seat) =>
            data.seatIds.includes(seat.id)
              ? { ...seat, isAvailable: data.isAvailable }
              : seat,
          ),
        );

        // Avmarkera stolar som reserverats av någon annan
        if (data.isAvailable === false && onSeatsTaken) {
          onSeatsTaken(data.seatIds);
        }
      } else {
        // Hämta om stolar vid avbokning eller utgången reservation
        fetchSeats(false);
      }
    });

    return () => {
      socket.emit("leave_screening", id);
      socket.disconnect();
    };
  }, [id, fetchSeats, onSeatsTaken]);

  return {
    seats,
    loading,
    error,
    fetchSeats,
    refetchSeats: fetchSeats,
  };
}
