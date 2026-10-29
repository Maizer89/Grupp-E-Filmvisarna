import { useState, useEffect, useCallback } from "react";
import { io } from "socket.io-client";

// Custom hook to manage seat data and real-time live updates via Socket.io
export default function useSeats(id, onSeatsTaken) {
  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch initial seat layout from REST API
  const fetchSeats = useCallback(async () => {
    if (!id) return;

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
  }, [id]);

  useEffect(() => {
    setLoading(true);
    fetchSeats();

    // Connect to Socket.io server (Card 14.1)
    const socket = io();

    // Join room for this specific screening (Card 14.2)
    socket.emit("join_screening", id);

    // Listen for real-time seat status updates (Card 14.3)
    socket.on("seat_status_changed", (data) => {
      if (data?.seatIds && data.seatIds.length > 0) {
        // Update local seat availability without reloading
        setSeats((prevSeats) =>
          prevSeats.map((seat) =>
            data.seatIds.includes(seat.id)
              ? { ...seat, isAvailable: data.isAvailable }
              : seat,
          ),
        );

        // Notify if newly booked seats conflict with active selections (Card 14.4)
        if (data.isAvailable === false && onSeatsTaken) {
          onSeatsTaken(data.seatIds);
        }
      } else {
        // Refresh seats if a booking was cancelled or expired
        fetchSeats();
      }
    });

    // Leave room and clean up socket connection on unmount (Card 14.5)
    return () => {
      socket.emit("leave_screening", id);
      socket.disconnect();
    };
  }, [id, fetchSeats, onSeatsTaken]);

  return { seats, loading, error, refetchSeats: fetchSeats };
}
