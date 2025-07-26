// backend/db.js (Versi untuk Deployment)

const mysql = require("mysql2/promise");
require("dotenv").config(); // Dibutuhkan agar bisa membaca variabel dari .env saat development

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT || 4000,
  ssl: {
    rejectUnauthorized: true, // Ini wajib untuk koneksi ke TiDB Cloud
  },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = pool;
