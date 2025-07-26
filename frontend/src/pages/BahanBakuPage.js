// frontend/src/pages/BahanBakuPage.js (Dengan Fitur Stok)

import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";

const API_URL = "https://pawon-ika-api.onrender.com";

// Komponen kecil untuk update stok cepat
const StokUpdater = ({ bahan, onUpdate }) => {
  const [jumlah, setJumlah] = useState("");

  const handleUpdate = (perubahan) => {
    const nilaiPerubahan = parseFloat(perubahan);
    if (isNaN(nilaiPerubahan) || nilaiPerubahan === 0) {
      toast.error("Masukkan jumlah yang valid.");
      return;
    }
    onUpdate(bahan.bahan_id, nilaiPerubahan);
    setJumlah(""); // Reset input setelah update
  };

  return (
    <div className="flex items-center gap-2 mt-2 md:mt-0">
      <input
        type="number"
        value={jumlah}
        onChange={(e) => setJumlah(e.target.value)}
        placeholder="Jumlah"
        className="p-2 border rounded w-24 text-sm"
      />
      <button
        onClick={() => handleUpdate(jumlah)}
        className="bg-green-500 text-white rounded px-2 py-2 text-sm font-bold hover:bg-green-600"
      >
        +
      </button>
      <button
        onClick={() => handleUpdate(-jumlah)}
        className="bg-red-500 text-white rounded px-2.5 py-2 text-sm font-bold hover:bg-red-600"
      >
        -
      </button>
    </div>
  );
};

function BahanBakuPage() {
  const [bahanList, setBahanList] = useState([]);
  const initialFormState = {
    nama: "",
    satuan: "",
    harga_per_satuan: "",
    jumlah_stok: "",
  };
  const [form, setForm] = useState(initialFormState);
  const [isEditing, setIsEditing] = useState(null);
  const [editForm, setEditForm] = useState(initialFormState);

  const fetchBahan = async () => {
    try {
      const response = await fetch(`${API_URL}/api/bahan`);
      const data = await response.json();
      setBahanList(data);
    } catch (error) {
      toast.error("Gagal memuat daftar bahan.");
    }
  };

  useEffect(() => {
    fetchBahan();
  }, []);

  const handleFormChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleEditFormChange = (e) =>
    setEditForm({ ...editForm, [e.target.name]: e.target.value });

  const handleEdit = (bahan) => {
    setIsEditing(bahan.bahan_id);
    setEditForm(bahan);
  };

  const handleCancelEdit = () => setIsEditing(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const promise = fetch(`${API_URL}/api/bahan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    }).then((res) => {
      if (!res.ok) throw new Error("Gagal menambahkan bahan.");
      return res.json();
    });

    toast.promise(promise, {
      loading: "Menyimpan...",
      success: "Bahan berhasil ditambahkan!",
      error: (err) => `Error: ${err.message}`,
    });

    promise.then(() => {
      setForm(initialFormState);
      fetchBahan();
    }).catch(console.error);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const promise = fetch(`${API_URL}/api/bahan/${isEditing}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    }).then((res) => {
      if (!res.ok) throw new Error("Gagal memperbarui bahan.");
    });

    toast.promise(promise, {
      loading: "Memperbarui...",
      success: "Bahan berhasil diperbarui!",
      error: (err) => `Error: ${err.message}`,
    });

    promise.then(() => {
      setIsEditing(null);
      fetchBahan();
    }).catch(console.error);
  };

  const handleDelete = (id) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus bahan ini?")) return;

    const promise = fetch(`${API_URL}/api/bahan/${id}`, { method: "DELETE" })
      .then((res) => {
        if (!res.ok) throw new Error("Gagal menghapus bahan.");
      });

    toast.promise(promise, {
      loading: "Menghapus...",
      success: "Bahan berhasil dihapus!",
      error: (err) => `Error: ${err.message}`,
    });

    promise.then(fetchBahan).catch(console.error);
  };

  const handleStokUpdate = async (id, jumlah_perubahan) => {
    const promise = fetch(`${API_URL}/api/bahan/${id}/update-stok`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jumlah_perubahan }),
    }).then((res) => {
      if (!res.ok) throw new Error("Gagal memperbarui stok.");
    });

    toast.promise(promise, {
      loading: "Memperbarui stok...",
      success: "Stok berhasil diperbarui!",
      error: (err) => `Error: ${err.message}`,
    });

    promise.then(fetchBahan).catch(console.error);
  };

  const getStokColor = (stok) => {
    if (stok <= 10) return "text-red-600";
    if (stok <= 50) return "text-yellow-600";
    return "text-green-600";
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Tambah Bahan Baku Baru</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          <input name="nama" value={form.nama} onChange={handleFormChange} placeholder="Nama Bahan" className="p-2 border rounded w-full md:col-span-2" required />
          <input name="satuan" value={form.satuan} onChange={handleFormChange} placeholder="Satuan (kg, pcs)" className="p-2 border rounded w-full" required />
          <input type="number" name="harga_per_satuan" value={form.harga_per_satuan} onChange={handleFormChange} placeholder="Harga" className="p-2 border rounded w-full" required />
          <input type="number" name="jumlah_stok" value={form.jumlah_stok} onChange={handleFormChange} placeholder="Stok Awal" className="p-2 border rounded w-full" />
          <button type="submit" className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 w-full font-semibold">
            Tambah
          </button>
        </form>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Daftar Bahan Baku</h2>
        <div className="space-y-3">
          {bahanList.map((bahan) => (
            <div key={bahan.bahan_id}>
              {isEditing === bahan.bahan_id ? (
                <form onSubmit={handleUpdate} className="p-4 bg-yellow-50 rounded-lg shadow-sm grid grid-cols-1 md:grid-cols-6 gap-3 items-center">
                  <input name="nama" value={editForm.nama} onChange={handleEditFormChange} className="p-2 border rounded w-full md:col-span-2" />
                  <input name="satuan" value={editForm.satuan} onChange={handleEditFormChange} className="p-2 border rounded w-full" />
                  <input type="number" name="harga_per_satuan" value={editForm.harga_per_satuan} onChange={handleEditFormChange} className="p-2 border rounded w-full" />
                  <input type="number" name="jumlah_stok" value={editForm.jumlah_stok} onChange={handleEditFormChange} className="p-2 border rounded w-full" />
                  <div className="flex gap-2 md:col-span-1">
                    <button type="submit" className="bg-green-500 text-white p-2 rounded w-full text-sm">Simpan</button>
                    <button type="button" onClick={handleCancelEdit} className="bg-gray-400 text-white p-2 rounded w-full text-sm">Batal</button>
                  </div>
                </form>
              ) : (
                <div className="p-4 bg-gray-50 rounded-lg shadow-sm flex flex-col md:flex-row justify-between md:items-center">
                  <div className="flex-grow">
                    <p className="font-semibold text-lg">{bahan.nama}</p>
                    <p className="text-sm text-gray-500">
                      Rp {parseInt(bahan.harga_per_satuan).toLocaleString("id-ID")} / {bahan.satuan}
                    </p>
                    <p className={`font-bold text-lg ${getStokColor(bahan.jumlah_stok)}`}>
                      Stok: {parseFloat(bahan.jumlah_stok).toLocaleString("id-ID")}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 mt-3 md:mt-0">
                    <StokUpdater bahan={bahan} onUpdate={handleStokUpdate} />
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(bahan)} className="bg-yellow-500 text-white p-2 rounded text-sm hover:bg-yellow-600">Edit</button>
                      <button onClick={() => handleDelete(bahan.bahan_id)} className="bg-red-500 text-white p-2 rounded text-sm hover:bg-red-600">Delete</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default BahanBakuPage;
