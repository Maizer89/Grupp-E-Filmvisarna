import { useState, useEffect } from "react";

export default function useTicketTypes() {
  const [ticketTypes, setTicketTypes] = useState([]);

  useEffect(() => {
    async function fetchTicketTypes() {
      try {
        const response = await fetch("/api/ticket-types");

        if (!response.ok) {
          throw new Error("Kunde inte hämta biljettyper");
        }

        const data = await response.json();
        setTicketTypes(data);
      } catch (error) {
        console.error("Fel vid hämtning av biljettyper:", error);
      }
    }

    fetchTicketTypes();
  }, []);

  return { ticketTypes };
}
