import { Router } from "express";
import db from "../db.js";
import { inloggadAnvandare, INTE_INLOGGAD } from "./konto.js";

// USER 18: se mina bokningar och bokningshistorik.
// USER 15: avboka en framtida bokning.
// Kräver att användaren är inloggad.
// Bokningar kopplas till användaren via e-post.

const BOKNING_SAKNAS = "Bokningen hittades inte";
const BARA_FRAMTIDA = "Bara framtida bokningar kan avbokas";
const AVBOKAD = "Bokningen är avbokad";

const router = Router();

const fel = (res, status, meddelande) =>
  res.status(status).json({ error: meddelande });

const tvaSiffror = (n) => String(n).padStart(2, "0");

// Omvandlar datum till lokal tid i formatet YYYY-MM-DDTHH:mm:ss.
function tillText(d) {
  return `${d.getFullYear()}-${tvaSiffror(d.getMonth() + 1)}-${tvaSiffror(d.getDate())}T${tvaSiffror(d.getHours())}:${tvaSiffror(d.getMinutes())}:${tvaSiffror(d.getSeconds())}`;
}

// GET /api/my-bookings
// Hämtar användarens kommande och tidigare bokningar.
router.get("/my-bookings", async (req, res) => {
  const anvandare = await inloggadAnvandare(req);

  if (!anvandare) {
    return fel(res, 401, INTE_INLOGGAD);
  }

  const [rader] = await db.query(
    `SELECT
      b.id AS bookingNumber,
      m.title,
      m.poster_url AS posterUrl,
      s.start_time AS startTime,
      a.name AS auditorium,
      GROUP_CONCAT(
        CONCAT('Rad ', st.row_number, ' Plats ', st.seat_number)
        ORDER BY st.row_number, st.seat_number
        SEPARATOR ','
      ) AS seats
    FROM bookings b
    JOIN screenings s ON s.id = b.screening_id
    JOIN movies m ON m.id = s.movie_id
    JOIN auditoriums a ON a.id = s.auditorium_id
    LEFT JOIN tickets t ON t.booking_id = b.id
    LEFT JOIN seats st ON st.id = t.seat_id
    WHERE b.customer_email = ?
      AND b.status = 'confirmed'
    GROUP BY
      b.id,
      m.title,
      m.poster_url,
      s.start_time,
      a.name
    ORDER BY s.start_time`,
    [anvandare.email],
  );

  const nu = Date.now();

  const alla = rader.map((r) => ({
    bookingNumber: r.bookingNumber,
    title: r.title,
    posterUrl: r.posterUrl,
    startTime: tillText(new Date(r.startTime)),
    auditorium: r.auditorium,
    seats: r.seats ? r.seats.split(",") : [],
    _tid: new Date(r.startTime).getTime(),
  }));

  // Tar bort interna tidsfältet innan svaret skickas.
  const utan = ({ _tid, ...resten }) => resten;

  res.json({
    upcoming: alla.filter((b) => b._tid > nu).map(utan),

    history: alla
      .filter((b) => b._tid <= nu)
      .reverse()
      .map(utan),
  });
});

// DELETE /api/my-bookings/:bookingNumber
// Avbokar en bekräftad framtida bokning.
router.delete("/my-bookings/:bookingNumber", async (req, res) => {
  const anvandare = await inloggadAnvandare(req);

  if (!anvandare) {
    return fel(res, 401, INTE_INLOGGAD);
  }

  const [rader] = await db.query(
    `SELECT
      b.id,
      s.start_time AS startTime
    FROM bookings b
    JOIN screenings s ON s.id = b.screening_id
    WHERE b.id = ?
      AND b.customer_email = ?
      AND b.status = 'confirmed'`,
    [req.params.bookingNumber, anvandare.email],
  );

  // 404 om bokningen saknas eller tillhör en annan användare.
  if (rader.length === 0) {
    return fel(res, 404, BOKNING_SAKNAS);
  }

  // Endast framtida bokningar får avbokas.
  if (new Date(rader[0].startTime).getTime() <= Date.now()) {
    return fel(res, 409, BARA_FRAMTIDA);
  }

  const [result] = await db.query(
    `UPDATE bookings
    SET status = 'cancelled',
        reserved_until = NULL
    WHERE id = ?
      AND status = 'confirmed'`,
    [rader[0].id],
  );

  if (result.affectedRows === 0) {
    return fel(res, 409, "Bokningen kunde inte avbokas");
  }

  res.json({ message: AVBOKAD });
});

export default router;
