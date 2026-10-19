import { sendBookingConfirmation } from "./services/emailService.js";

console.log("🚀 Testar emailService...");

const testData = {
  to: "kund@example.com",
  bookingNumber: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  movieTitle: "Interstellar",
  screeningTime: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
  auditoriumName: "Stora Salongen",
  seats: [
    { rowNumber: 4, seatNumber: 12 },
    { rowNumber: 4, seatNumber: 13 },
  ],
  totalPrice: 280,
};

const result = await sendBookingConfirmation(testData);

console.log("Resultat:", result);

