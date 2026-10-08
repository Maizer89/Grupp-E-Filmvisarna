import mysql from "mysql2/promise";
import "dotenv/config";

console.log(
  "DB_HOST är:",
  process.env.DB_HOST,
  "Port är:",
  process.env.DB_PORT,
);

const db = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: { rejectUnauthorized: false },
});

export default db;
