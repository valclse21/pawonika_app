// frontend/src/pages/EditResepPage.js (Versi Perbaikan Final)

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const API_URL = "https://pawon-ika-api.onrender.com";

function EditResepPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [bahanList, setBahanList] = useState([]);
  const [form, setForm] = useState(null); // Mulai dengan null
  const [bahanUntukResep, setBahanUntukResep] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // PERBAIKAN: Tambahkan pengecekan ini. Jangan lakukan apa-apa jika ID belum ada.
    if (!id) {
      setIsLoading(false);
      setError("ID Resep tidak ditemukan di URL.");
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      setError("");
      try {
        // Ambil semua bahan baku untuk dropdown (dijalankan bersamaan)
        const bahanPromise = fetch(`${API_URL}/api/bahan`);
        // Ambil data resep yang akan diedit
        const resepPromise = fetch(`${API_URL}/api/resep/${id}`);

        const [bahanRes, resepRes] = await Promise.all([
          bahanPromise,
          resepPromise,
        ]);

        if (!bahanRes.ok || !resepRes.ok) {
          throw new Error("Gagal memuat data awal dari server.");
        }

        const bahanData = await bahanRes.json();
        const resepData = await resepRes.json();

        setBahanList(bahanData);
        setForm({
          nama_menu: resepData.nama_menu,
          porsi_per_resep: resepData.porsi_per_resep,
          deskripsi: resepData.deskripsi || "",
        });
        // Pastikan bahan adalah array sebelum di-map
        setBahanUntukResep(
          Array.isArray(resepData.bahan)
            ? resepData.bahan.map((b) => ({
                bahan_id: b.bahan_id,
                jumlah: b.jumlah,
              }))
            : []
        );
      } catch (err) {
        console.error("Gagal memuat data untuk diedit", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // ... (sisa fungsi seperti handleFormChange, handleSubmit, dll. tetap sama) ...
  const handleFormChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });
  const handleBahanChange = (index, e) => {
    const newBahan = [...bahanUntukResep];
    newBahan[index][e.target.name] = e.target.value;
    setBahanUntukResep(newBahan);
  };
  const tambahBahanRow = () =>
    setBahanUntukResep([...bahanUntukResep, { bahan_id: "", jumlah: "" }]);
  const hapusBahanRow = (index) =>
    setBahanUntukResep(bahanUntukResep.filter((_, i) => i !== index));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const bahanValid = bahanUntukResep.filter(
      (b) => b.bahan_id && b.jumlah > 0
    );
    if (bahanValid.length === 0) return alert("Harap isi minimal satu bahan.");

    const payload = { ...form, bahan: bahanValid };

    const response = await fetch(`${API_URL}/api/resep/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      alert("Resep berhasil diperbarui!");
      navigate("/resep");
    } else {
      alert("Gagal memperbarui resep.");
    }
  };

  if (isLoading)
    return <p className="text-center p-10">Memuat data resep...</p>;
  if (error)
    return <p className="text-center p-10 text-red-500">Error: {error}</p>;
  if (!form)
    return (
      <p className="text-center p-10">
        Tidak ada data resep untuk ditampilkan.
      </p>
    );

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Edit Resep: {form.nama_menu}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            name="nama_menu"
            value={form.nama_menu}
            onChange={handleFormChange}
            placeholder="Nama Menu"
            className="p-2 border rounded w-full"
            required
          />
          <input
            type="number"
            name="porsi_per_resep"
            value={form.porsi_per_resep}
            onChange={handleFormChange}
            placeholder="Resep untuk Berapa Porsi?"
            className="p-2 border rounded w-full"
            required
          />
        </div>
        <textarea
          name="deskripsi"
          value={form.deskripsi}
          onChange={handleFormChange}
          placeholder="Deskripsi singkat menu"
          className="p-2 border rounded w-full"
        ></textarea>

        <h3 className="font-semibold pt-4 border-t mt-4">
          Bahan yang Dibutuhkan:
        </h3>
        {bahanUntukResep.map((item, index) => (
          <div key={index} className="flex gap-2 items-center">
            <select
              name="bahan_id"
              value={item.bahan_id}
              onChange={(e) => handleBahanChange(index, e)}
              className="p-2 border rounded w-full"
              required
            >
              <option value="">-- Pilih Bahan --</option>
              {bahanList.map((b) => (
                <option key={b.bahan_id} value={b.bahan_id}>
                  {b.nama}
                </option>
              ))}
            </select>
            <input
              type="number"
              step="0.01"
              name="jumlah"
              value={item.jumlah}
              onChange={(e) => handleBahanChange(index, e)}
              placeholder="Jumlah"
              className="p-2 border rounded w-1/3"
              required
            />
            {bahanUntukResep.length > 1 && (
              <button
                type="button"
                onClick={() => hapusBahanRow(index)}
                className="bg-red-500 text-white p-2 rounded hover:bg-red-600"
              >
                X
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={tambahBahanRow}
          className="text-sm text-blue-600 hover:underline"
        >
          + Tambah Baris Bahan
        </button>
        <button
          type="submit"
          className="bg-green-600 text-white p-3 rounded hover:bg-green-700 w-full font-bold text-lg"
        >
          Simpan Perubahan
        </button>
      </form>
    </div>
  );
}

export default EditResepPage;
