import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";

let cachedTransporter = null;

/**
 * Hämtar eller skapar en Nodemailer transporter.
 * Om inga SMTP-uppgifter finns i .env skapas ett gratis testkonto via Ethereal Mail
 * med en klickbar förhandsgranskningslänk i terminalen.
 */
export async function getTransporter() {
  if (cachedTransporter) {
    return cachedTransporter;
  }

  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    cachedTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    // Skapar automatiskt test-konto på Ethereal för utveckling/demonstration
    const testAccount = await nodemailer.createTestAccount();
    cachedTransporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log("ℹ️ Ethereal Mail testkonto initierat:", testAccount.user);
  }

  return cachedTransporter;
}

/**
 * Genererar en enkel och tydlig HTML-mall för bokningsbekräftelsen.
 */
export function generateBookingEmailHtml({
  bookingNumber,
  movieTitle,
  screeningTime,
  auditoriumName,
  seats = [],
  totalPrice,
}) {
  const formattedDate = screeningTime
    ? new Date(screeningTime).toLocaleString("sv-SE", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "Tid ej angiven";

  const seatText =
    seats.length > 0
      ? seats
          .map((s) => `Rad ${s.rowNumber ?? s.row_number}, Stol ${s.seatNumber ?? s.seat_number}`)
          .join(", ")
      : "Inga stolar angivna";

  return `
  <div style="font-family: Arial, sans-serif; color: #333; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
    <h2 style="color: #e11d48; margin-top: 0;">Filmvisarna – Bokningsbekräftelse</h2>
    <p>Hej! Tack för din bokning. Här är dina bokningsuppgifter:</p>
    
    <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; margin: 15px 0;">
      <p style="margin: 5px 0;"><strong>Bokningsnummer:</strong> ${bookingNumber}</p>
      <p style="margin: 5px 0;"><strong>Film:</strong> ${movieTitle}</p>
      <p style="margin: 5px 0;"><strong>Datum & Tid:</strong> ${formattedDate}</p>
      ${auditoriumName ? `<p style="margin: 5px 0;"><strong>Salong:</strong> ${auditoriumName}</p>` : ""}
      <p style="margin: 5px 0;"><strong>Platser:</strong> ${seatText}</p>
      ${totalPrice !== undefined ? `<p style="margin: 5px 0;"><strong>Totalt pris:</strong> ${totalPrice} kr</p>` : ""}
    </div>

    <p style="font-size: 13px; color: #666;">
      Uppge ditt bokningsnummer vid kassan eller insläppet. Välkommen!
    </p>
  </div>
  `;
}

/**
 * Skickar bokningsbekräftelse till angiven e-post.
 */
export async function sendBookingConfirmation({
  to,
  bookingNumber,
  movieTitle,
  screeningTime,
  auditoriumName,
  seats = [],
  totalPrice,
}) {
  if (!to) {
    console.warn("⚠️ Ingen mottagaradress angiven, inget mail skickas.");
    return { success: false, error: "Mottagaradress saknas" };
  }

  try {
    const html = generateBookingEmailHtml({
      bookingNumber,
      movieTitle,
      screeningTime,
      auditoriumName,
      seats,
      totalPrice,
    });

    // 💾 Spara alltid lokalt till en HTML-fil så man kan testa 100 % offline
    const localFilePath = path.resolve(process.cwd(), "latest_booking_email.html");
    fs.writeFileSync(localFilePath, html, "utf-8");
    console.log(`💾 E-post sparad lokalt (offline): file://${localFilePath}`);

    let previewUrl = null;
    let messageId = null;

    try {
      const transporter = await getTransporter();
      const info = await transporter.sendMail({
        from: '"Filmvisarna" <noreply@filmvisarna.se>',
        to,
        subject: `Bokningsbekräftelse: ${movieTitle} (${bookingNumber})`,
        html,
      });

      messageId = info.messageId;
      previewUrl = nodemailer.getTestMessageUrl(info);
      console.log(`✉️ Bekräftelsemail skickat till: ${to}`);
      if (previewUrl) {
        console.log(`🔗 Förhandsgranska online (Ethereal): ${previewUrl}`);
      }
    } catch (netErr) {
      console.warn("⚠️ Kunde inte ansluta till extern SMTP (offline-läge aktiverat):", netErr.message);
    }

    return {
      success: true,
      messageId,
      previewUrl,
      localFile: localFilePath,
    };
  } catch (error) {
    console.error("❌ Misslyckades med att generera eller skicka mail:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

