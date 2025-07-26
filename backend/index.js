// backend/index.js (Versi Final untuk Deployment)

const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
require("dotenv").config(); // <-- PENTING: Untuk membaca environment variables

const app = express();
app.use(cors());
app.use(express.json());

const pool = require('./db'); // Mengimpor pool dari db.js

// Cek koneksi database
pool.getConnection()
    .then(connection => {
        console.log('🚀 Server backend terkoneksi ke database.');
        connection.release();
    })
    .catch(err => {
        console.error('❌ Gagal terkoneksi ke database:', err);
        process.exit(1); // Keluar dari aplikasi jika koneksi gagal
    });

// =================================================================
// API ENDPOINTS
// =================================================================

// --- API UNTUK BAHAN BAKU ---

// GET SEMUA BAHAN
app.get("/api/bahan", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM bahan_baku ORDER BY nama ASC"
    );
    res.status(200).json(rows);
  } catch (error) {
    console.error("Error di GET /api/bahan:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// POST BAHAN BARU
app.post("/api/bahan", async (req, res) => {
  try {
    const { nama, satuan, harga_per_satuan } = req.body;
    const query =
      "INSERT INTO bahan_baku (nama, satuan, harga_per_satuan) VALUES (?, ?, ?)";
    const [result] = await pool.query(query, [nama, satuan, harga_per_satuan]);
    res.status(201).json({ id: result.insertId, ...req.body });
  } catch (error) {
    console.error("Error di POST /api/bahan:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// PUT (UPDATE) BAHAN BAKU
app.put("/api/bahan/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const { nama, satuan, harga_per_satuan } = req.body;
    const query =
      "UPDATE bahan_baku SET nama = ?, satuan = ?, harga_per_satuan = ? WHERE bahan_id = ?";
    await pool.query(query, [nama, satuan, harga_per_satuan, id]);
    res
      .status(200)
      .json({ message: `Bahan baku ID ${id} berhasil diperbarui` });
  } catch (error) {
    console.error(`Error di PUT /api/bahan/${id}:`, error);
    res.status(500).json({ message: "Server Error" });
  }
});

// DELETE BAHAN BAKU
app.delete("/api/bahan/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM bahan_baku WHERE bahan_id = ?", [id]);
    res.status(200).json({ message: `Bahan baku ID ${id} berhasil dihapus` });
  } catch (error) {
    console.error(`Error di DELETE /api/bahan/${id}:`, error);
    res.status(500).json({ message: "Server Error" });
  }
});

// --- API UNTUK RESEP ---

// GET SEMUA RESEP
app.get("/api/resep", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM resep ORDER BY nama_menu ASC"
    );
    res.status(200).json(rows);
  } catch (error) {
    console.error("Error di GET /api/resep:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// GET DETAIL SATU RESEP
app.get("/api/resep/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const resepQuery = "SELECT * FROM resep WHERE resep_id = ?";
    const [resepRows] = await pool.query(resepQuery, [id]);
    if (resepRows.length === 0)
      return res.status(404).json({ message: "Resep tidak ditemukan" });

    const bahanQuery = `
            SELECT b.bahan_id, rb.jumlah, b.nama, b.satuan, b.harga_per_satuan
            FROM resep_bahan rb
            JOIN bahan_baku b ON rb.bahan_id = b.bahan_id
            WHERE rb.resep_id = ?`;
    const [bahanRows] = await pool.query(bahanQuery, [id]);

    const hppTotalResep = bahanRows.reduce(
      (total, bahan) => total + bahan.jumlah * bahan.harga_per_satuan,
      0
    );
    const porsi = resepRows[0].porsi_per_resep;
    const hppPerPorsi = porsi > 0 ? hppTotalResep / porsi : 0;

    res
      .status(200)
      .json({ ...resepRows[0], bahan: bahanRows, hpp_per_porsi: hppPerPorsi });
  } catch (error) {
    console.error(`Error di GET /api/resep/${id}:`, error);
    res.status(500).json({ message: "Gagal mengambil detail resep" });
  }
});

// POST RESEP BARU
app.post("/api/resep", async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const { nama_menu, porsi_per_resep, deskripsi, bahan } = req.body;
    const resepQuery =
      "INSERT INTO resep (nama_menu, porsi_per_resep, deskripsi) VALUES (?, ?, ?)";
    const [resepResult] = await connection.query(resepQuery, [
      nama_menu,
      porsi_per_resep,
      deskripsi || null,
    ]);
    const resepIdBaru = resepResult.insertId;
    const bahanValues = bahan.map((b) => [
      resepIdBaru,
      parseInt(b.bahan_id),
      parseFloat(b.jumlah),
    ]);
    const bahanQuery =
      "INSERT INTO resep_bahan (resep_id, bahan_id, jumlah) VALUES ?";
    await connection.query(bahanQuery, [bahanValues]);
    await connection.commit();
    res
      .status(201)
      .json({ message: "Resep berhasil dibuat!", id: resepIdBaru });
  } catch (error) {
    await connection.rollback();
    console.error("Error di POST /api/resep:", error);
    res.status(500).json({
      message: "Gagal menyimpan resep ke database.",
      error: error.message,
    });
  } finally {
    if (connection) connection.release();
  }
});

// PUT (UPDATE) RESEP
app.put("/api/resep/:id", async (req, res) => {
  const { id } = req.params;
  const connection = await pool.getConnection();
  try {
    const { nama_menu, porsi_per_resep, deskripsi, bahan } = req.body;
    await connection.beginTransaction();
    await connection.query(
      "UPDATE resep SET nama_menu = ?, porsi_per_resep = ?, deskripsi = ? WHERE resep_id = ?",
      [nama_menu, porsi_per_resep, deskripsi, id]
    );
    await connection.query("DELETE FROM resep_bahan WHERE resep_id = ?", [id]);
    const bahanValues = bahan.map((b) => [
      id,
      parseInt(b.bahan_id),
      parseFloat(b.jumlah),
    ]);
    await connection.query(
      "INSERT INTO resep_bahan (resep_id, bahan_id, jumlah) VALUES ?",
      [bahanValues]
    );
    await connection.commit();
    res.status(200).json({ message: `Resep ID ${id} berhasil diperbarui` });
  } catch (error) {
    await connection.rollback();
    console.error(`Error di PUT /api/resep/${id}:`, error);
    res.status(500).json({ message: "Gagal memperbarui resep" });
  } finally {
    if (connection) connection.release();
  }
});

// DELETE RESEP
app.delete("/api/resep/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query("DELETE FROM resep WHERE resep_id = ?", [
      id,
    ]);
    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: `Resep dengan ID ${id} tidak ditemukan` });
    }
    res.status(200).json({ message: `Resep ID ${id} berhasil dihapus` });
  } catch (error) {
    console.error(`Error di DELETE /api/resep/${id}:`, error);
    res.status(500).json({ message: "Server Error" });
  }
});

// --- Server Start ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server backend berjalan di port ${PORT}`);
});
