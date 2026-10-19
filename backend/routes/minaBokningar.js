import { Router } from "express";
import db from "../db.js";
import { inloggadAnvandare, INTE_INLOGGAD } from "./konto.js";

// USER  18: se mina bokningar och bokningshistorik.   USER 15: avboka en framtida bokning.
// Kräver att man är inloggad (konto.js). Bokningar kopplas till användaren via e-post
// (bookings.customerEmail = users.email).

const BOKNING_SAKNAS = "Bokningen hittades inte";
const BARA_FRAMTIDA = "Bara framtida bokningar kan avbokas";
const AVBOKAD = "Bokningen är avbokad";

const router = Router();
const fel = (res, status, meddelande) =>
  res.status(status).json({ error: meddelande });
const tvaSiffror = (n) => String(n).padStart(2, "0");

// Date -> "2026-10-16T18:00:00" (lokal tid, så att sidorna kan visa tiden som den är)
function tillText(d) {
  return `${d.getFullYear()}-${tvaSiffror(d.getMonth() + 1)}-${tvaSiffror(d.getDate())}T${tvaSiffror(d.getHours())}:${tvaSiffror(d.getMinutes())}:${tvaSiffror(d.getSeconds())}`;
}

// GET /api/my-bookings -> { upcoming: [...närmast först], history: [...senaste först] }
router.get("/my-bookings", async (req, res) => {
  const anvandare = await inloggadAnvandare(req);
  if (!anvandare) return fel(res, 401, INTE_INLOGGAD);

  const [rader] = await db.query(
    `SELECT
    b.id AS bookingNumber,
    m.title,
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
  GROUP BY b.id, m.title, s.start_time, a.name
  ORDER BY s.start_time`,
    [anvandare.email],
  );

  const nu = Date.now();
  const alla = rader.map((r) => ({
    bookingNumber: r.bookingNumber,
    title: r.title,
    startTime: tillText(new Date(r.startTime)),
    auditorium: r.auditorium,
    seats: r.seats ? r.seats.split(",") : [],
    _tid: new Date(r.startTime).getTime(),
  }));
  const utan = ({ _tid, ...resten }) => resten;

  res.json({
    upcoming: alla.filter((b) => b._tid > nu).map(utan),
    history: alla
      .filter((b) => b._tid <= nu)
      .reverse()
      .map(utan),
  });
});

// DELETE /api/my-bookings/FV-10001 -> tar bort bokningen och dess stolar (stolarna blir lediga)
router.delete("/my-bookings/:bookingNumber", async (req, res) => {
  const anvandare = await inloggadAnvandare(req);
  if (!anvandare) return fel(res, 401, INTE_INLOGGAD);

  const [rader] = await db.query(
    `SELECT b.id, s.start_time AS startTime
   FROM bookings b
   JOIN screenings s ON s.id = b.screening_id
   WHERE b.id = ?
     AND b.customer_email = ?
     AND b.status = 'confirmed'`,
    [req.params.bookingNumber, anvandare.email],
  );

  // 404 både när numret saknas och när bokningen tillhör någon annan
  if (rader.length === 0) return fel(res, 404, BOKNING_SAKNAS);
  if (new Date(rader[0].startTime).getTime() <= Date.now())
    return fel(res, 409, BARA_FRAMTIDA);

  const [result] = await db.query(
    `UPDATE bookings
   SET status = 'cancelled',
       reserved_until = NULL
   WHERE id = ? AND status = 'confirmed'`,
    [rader[0].id],
  );

  if (result.affectedRows === 0) {
    return res.status(409).json({
      error: "Bokningen kunde inte avbokas",
    });
  }
  res.json({ message: AVBOKAD });
});

export default router;
