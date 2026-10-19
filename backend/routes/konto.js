import { Router } from "express";
import crypto from "node:crypto";
import db from "../db.js";

// USER 16: skapa konto.   USER 17: logga in (och ut).
// Monteras under /api/auth i servern: app.use("/api/auth", konto)
// Inloggningen sparas i en session (cookie). Kräver tabellen users (users.sql) och express-session i servern.

const MIN_LOSENORD_LANGD = 8;
const EPOST_MONSTER = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
export const INTE_INLOGGAD = "Du måste logga in";
const OGILTIG_EPOST = "Ogiltig e-postadress";
const FOR_KORT_LOSENORD = `Lösenordet måste vara minst ${MIN_LOSENORD_LANGD} tecken`;
const EPOST_FINNS_REDAN = "Det finns redan ett konto med den e-postadressen";
const FEL_INLOGGNING = "Fel e-post eller lösenord";
const KONTO_SKAPAT = "Kontot skapades, du kan nu logga in";
const UTLOGGAD = "Du är utloggad";

const router = Router();
const fel = (res, status, meddelande) =>
  res.status(status).json({ error: meddelande });

function hash(losenord) {
  const salt = crypto.randomBytes(16);
  return `${salt.toString("base64")}:${crypto.scryptSync(losenord, salt, 32).toString("base64")}`;
}

function stammer(losenord, sparat) {
  const [salt, forvantat] = String(sparat).split(":");
  if (!salt || !forvantat) return false;
  const nytt = crypto.scryptSync(losenord, Buffer.from(salt, "base64"), 32);
  const gammalt = Buffer.from(forvantat, "base64");
  return (
    gammalt.length === nytt.length && crypto.timingSafeEqual(gammalt, nytt)
  );
}

// Den som är inloggad, eller undefined. Används också av minaBokningar.js
export async function inloggadAnvandare(req) {
  if (!req.session?.userId) return undefined;

  const [rader] = await db.query(
    "SELECT id, first_name, last_name, email, role FROM users WHERE id = ?",
    [req.session.userId],
  );

  return rader[0];
}

// POST /api/auth/register   { firstName, lastName, email, password }
router.post("/register", async (req, res) => {
  const { firstName, lastName, email, password } = req.body ?? {};
  if (
    typeof firstName !== "string" ||
    !firstName.trim() ||
    typeof lastName !== "string" ||
    !lastName.trim()
  ) {
    return fel(res, 400, "Förnamn och efternamn måste anges");
  }
  if (typeof email !== "string" || !EPOST_MONSTER.test(email.trim()))
    return fel(res, 400, OGILTIG_EPOST);
  if (typeof password !== "string" || password.length < MIN_LOSENORD_LANGD)
    return fel(res, 400, FOR_KORT_LOSENORD);

  try {
    await db.query(
      `INSERT INTO users (first_name, last_name, email, password_hash)
   VALUES (?, ?, ?, ?)`,
      [
        firstName.trim(),
        lastName.trim(),
        email.trim().toLowerCase(),
        hash(password),
      ],
    );
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") return fel(res, 409, EPOST_FINNS_REDAN); // email är UNIQUE i databasen
    throw err;
  }
  res.status(201).json({ message: KONTO_SKAPAT });
});

// POST /api/auth/login   { email, password }
router.post("/login", async (req, res) => {
  const { email, password } = req.body ?? {};
  if (typeof email !== "string" || typeof password !== "string")
    return fel(res, 401, FEL_INLOGGNING);

  const [rader] = await db.query(
    `SELECT id, first_name, last_name, email, password_hash, role
   FROM users
   WHERE email = ?`,
    [email.trim().toLowerCase()],
  );
  const anvandare = rader[0];

  // Samma felmeddelande för "finns inte" och "fel lösenord"
  if (!anvandare || !stammer(password, anvandare.password_hash))
    return fel(res, 401, FEL_INLOGGNING);

  req.session.regenerate((err) => {
    if (err) {
      return res.status(500).json({
        error: "Kunde inte logga in",
      });
    }

    req.session.userId = anvandare.id;

    req.session.save((err) => {
      if (err) {
        return res.status(500).json({
          error: "Kunde inte logga in",
        });
      }

      res.json({
        id: anvandare.id,
        firstName: anvandare.first_name,
        lastName: anvandare.last_name,
        email: anvandare.email,
        role: anvandare.role,
      });
    });
  });
});

// DELETE /api/auth/logout
router.delete("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({
        error: "Kunde inte logga ut",
      });
    }

    res.clearCookie("connect.sid");
    res.json({ message: UTLOGGAD });
  });
});

// GET /api/auth/me -> vem är inloggad? (401 om ingen)
router.get("/me", async (req, res) => {
  const anvandare = await inloggadAnvandare(req);
  if (!anvandare) return fel(res, 401, INTE_INLOGGAD);
  res.json({
    id: anvandare.id,
    firstName: anvandare.first_name,
    lastName: anvandare.last_name,
    email: anvandare.email,
    role: anvandare.role,
  });
});

export default router;
