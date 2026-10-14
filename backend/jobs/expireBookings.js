import db from "../db.js";

export async function expirePendingBookings() {
  try {
    const [result] = await db.query(
      `UPDATE bookings
       SET status = 'expired'
       WHERE status = 'pending'
         AND reserved_until <= NOW()`,
    );

    if (result.affectedRows > 0) {
      console.log(`Expired ${result.affectedRows} bookings`);
    }
  } catch (error) {
    console.error("Error expiring bookings:", error);
  }
}
