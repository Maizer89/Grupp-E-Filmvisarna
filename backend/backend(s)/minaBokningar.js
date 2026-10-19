import { Router } from "express";
import db from "./db.js";
import { inloggadAnvandare, INTE_INLOGGAD } from "./konto.js";

// USER  18: se mina bokningar och bokningshistorik.   USER 15: avboka en framtida bokning.
// Kräver att man är inloggad (konto.js). Bokningar kopplas till användaren via e-post
// (bookings.customerEmail = users.email).

const BOKNING_SAKNAS = "Bokningen hittades inte";
const BARA_FRAMTIDA = "Bara framtida bokningar kan avbokas";
const AVBOKAD = "Bokningen är avbokad";

const router = Router();
const fel = (res, status, meddelande) => res.status(status).json({ error: meddelande });
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
    `SELECT b.bookingNumber, m.title, s.startTime, a.name AS auditorium,
            GROUP_CONCAT(bs.seatLabel ORDER BY bs.seatLabel SEPARATOR ',') AS seats
     FROM bookings b
     JOIN screenings s ON s.id = b.screeningId
     JOIN movies m ON m.id = s.movieId
     JOIN auditoriums a ON a.id = s.auditoriumId
     LEFT JOIN bookedSeats bs ON bs.bookingId = b.id
     WHERE b.customerEmail = ?
     GROUP BY b.id, b.bookingNumber, m.title, s.startTime, a.name
     ORDER BY s.startTime`,
    [anvandare.email]
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
    history: alla.filter((b) => b._tid <= nu).reverse().map(utan),
  });
});

// DELETE /api/my-bookings/FV-10001 -> tar bort bokningen och dess stolar (stolarna blir lediga)
router.delete("/my-bookings/:bookingNumber", async (req, res) => {
  const anvandare = await inloggadAnvandare(req);
  if (!anvandare) return fel(res, 401, INTE_INLOGGAD);

  const [rader] = await db.query(
    `SELECT b.id, s.startTime FROM bookings b
     JOIN screenings s ON s.id = b.screeningId
     WHERE b.bookingNumber = ? AND b.customerEmail = ?`,
    [req.params.bookingNumber, anvandare.email]
  );

  // 404 både när numret saknas och när bokningen tillhör någon annan
  if (rader.length === 0) return fel(res, 404, BOKNING_SAKNAS);
  if (new Date(rader[0].startTime).getTime() <= Date.now()) return fel(res, 409, BARA_FRAMTIDA);

  
  const anslutning = await db.getConnection();
  try {
    await anslutning.beginTransaction();
    await anslutning.query("DELETE FROM bookedSeats WHERE bookingId = ?", [rader[0].id]);
    await anslutning.query("DELETE FROM bookings WHERE id = ?", [rader[0].id]);
    await anslutning.commit();
  } catch (err) {
    await anslutning.rollback();
    throw err;
  } finally {
    anslutning.release();
  }
  res.json({ message: AVBOKAD });
});

export default router;
