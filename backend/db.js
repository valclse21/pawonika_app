// backend/db.js
const mysql = require("mysql2");

// Konfigurasi koneksi ke database MySQL lokal (XAMPP)
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "", // Password default XAMPP biasanya kosong
  database: "pawon_ika_db",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Menggunakan .promise() agar bisa memakai async/await
module.exports = pool.promise();
