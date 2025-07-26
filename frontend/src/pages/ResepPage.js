// frontend/src/pages/ResepPage.js

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const API_URL = "http://localhost:5000";

function ResepPage() {
  const [resepList, setResepList] = useState([]);
  const [bahanList, setBahanList] = useState([]);
  const initialFormState = {
    nama_menu: "",
    porsi_per_resep: "",
    deskripsi: "",
  };
  const [form, setForm] = useState(initialFormState);
  const initialBahanState = [{ bahan_id: "", jumlah: "" }];
  const [bahanUntukResep, setBahanUntukResep] = useState(initialBahanState);

  const fetchResep = async () => {
    const res = await fetch(`${API_URL}/api/resep`);
    setResepList(await res.json());
  };
  const fetchBahan = async () => {
    const res = await fetch(`${API_URL}/api/bahan`);
    setBahanList(await res.json());
  };

  useEffect(() => {
    fetchResep();
    fetchBahan();
  }, []);

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
    const response = await fetch(`${API_URL}/api/resep`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      alert("Resep berhasil disimpan!");
      fetchResep();
      setForm(initialFormState);
      setBahanUntukResep(initialBahanState);
    } else {
      alert("Gagal menyimpan resep.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus resep ini?")) {
      await fetch(`${API_URL}/api/resep/${id}`, { method: "DELETE" });
      fetchResep();
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Buat Resep Baru</h2>
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
            Simpan Resep
          </button>
        </form>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Daftar Resep</h2>
        <div className="space-y-3">
          {resepList.map((resep) => (
            <div
              key={resep.resep_id}
              className="p-4 bg-gray-50 rounded-lg shadow-sm flex justify-between items-center"
            >
              <p className="font-semibold text-lg">{resep.nama_menu}</p>
              <div className="flex gap-2">
                <Link
                  to={`/resep/${resep.resep_id}/edit`}
                  className="bg-yellow-500 text-white px-3 py-2 rounded text-sm font-semibold hover:bg-yellow-600"
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(resep.resep_id)}
                  className="bg-red-500 text-white px-3 py-2 rounded text-sm font-semibold hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ResepPage;
