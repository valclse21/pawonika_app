// backend/test-db.js

// Hanya import mysql2/promise untuk pengetesan
const mysql = require("mysql2/promise");

// Fungsi async untuk menjalankan tes
async function testConnection() {
  let connection;
  try {
    console.log("Mencoba terhubung ke database MySQL...");

    // Konfigurasi sama persis seperti di index.js
    connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "", // Password default XAMPP biasanya kosong
      database: "pawon_ika_db",
    });

    console.log("✅ Koneksi awal berhasil!");

    // Menjalankan query paling sederhana
    const [rows] = await connection.execute("SELECT NOW() as waktu_server;");

    console.log("✅ Query sederhana berhasil dijalankan!");
    console.log("-------------------------------------------");
    console.log("Waktu dari server database:", rows[0].waktu_server);
    console.log("-------------------------------------------");
    console.log(
      "🎉 SELAMAT! Koneksi dari Node.js ke MySQL Anda BEKERJA DENGAN BAIK."
    );
  } catch (error) {
    console.error("-------------------------------------------");
    console.error("❌ GAGAL TERHUBUNG KE DATABASE! ❌");
    console.error("-------------------------------------------");
    console.error("Pesan Error:", error.message);
    console.error("Kode Error:", error.code);
    console.error("-------------------------------------------");
    console.error(
      "Pastikan service MySQL di XAMPP sudah berjalan dan konfigurasi (user, password, database) sudah benar."
    );
  } finally {
    // Selalu tutup koneksi setelah selesai
    if (connection) {
      await connection.end();
      console.log("Koneksi ditutup.");
    }
  }
}

// Panggil fungsi untuk memulai tes
testConnection();
