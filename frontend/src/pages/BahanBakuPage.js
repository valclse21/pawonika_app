// frontend/src/pages/BahanBakuPage.js

import React, { useState, useEffect } from "react";
import toast from "react-hot-toast"; // <-- Import untuk notifikasi

const API_URL = "https://pawon-ika-api.onrender.com";

function BahanBakuPage() {
  const [bahanList, setBahanList] = useState([]);
  const [form, setForm] = useState({
    nama: "",
    satuan: "",
    harga_per_satuan: "",
  });
  const [isEditing, setIsEditing] = useState(null);
  const [editForm, setEditForm] = useState({
    nama: "",
    satuan: "",
    harga_per_satuan: "",
  });

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

    promise
      .then(() => {
        setForm({ nama: "", satuan: "", harga_per_satuan: "" });
        fetchBahan();
      })
      .catch((err) => console.error(err));
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

    promise
      .then(() => {
        setIsEditing(null);
        fetchBahan();
      })
      .catch((err) => console.error(err));
  };

  const handleDelete = (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus bahan ini?")) {
      const promise = fetch(`${API_URL}/api/bahan/${id}`, {
        method: "DELETE",
      }).then((res) => {
        if (!res.ok) throw new Error("Gagal menghapus bahan.");
      });

      toast.promise(promise, {
        loading: "Menghapus...",
        success: "Bahan berhasil dihapus!",
        error: (err) => `Error: ${err.message}`,
      });

      promise.then(() => fetchBahan()).catch((err) => console.error(err));
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Tambah Bahan Baku Baru</h2>
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end"
        >
          <input
            name="nama"
            value={form.nama}
            onChange={handleFormChange}
            placeholder="Nama Bahan"
            className="p-2 border rounded w-full md:col-span-1"
            required
          />
          <input
            name="satuan"
            value={form.satuan}
            onChange={handleFormChange}
            placeholder="Satuan (kg, pcs)"
            className="p-2 border rounded w-full"
            required
          />
          <input
            type="number"
            name="harga_per_satuan"
            value={form.harga_per_satuan}
            onChange={handleFormChange}
            placeholder="Harga"
            className="p-2 border rounded w-full"
            required
          />
          <button
            type="submit"
            className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 w-full font-semibold"
          >
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
                <form
                  onSubmit={handleUpdate}
                  className="p-4 bg-yellow-50 rounded-lg shadow-sm grid grid-cols-1 md:grid-cols-5 gap-3 items-center"
                >
                  <input
                    name="nama"
                    value={editForm.nama}
                    onChange={handleEditFormChange}
                    className="p-2 border rounded w-full md:col-span-2"
                  />
                  <input
                    name="satuan"
                    value={editForm.satuan}
                    onChange={handleEditFormChange}
                    className="p-2 border rounded w-full"
                  />
                  <input
                    type="number"
                    name="harga_per_satuan"
                    value={editForm.harga_per_satuan}
                    onChange={handleEditFormChange}
                    className="p-2 border rounded w-full"
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="bg-green-500 text-white p-2 rounded w-full text-sm"
                    >
                      Simpan
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="bg-gray-400 text-white p-2 rounded w-full text-sm"
                    >
                      Batal
                    </button>
                  </div>
                </form>
              ) : (
                <div className="p-4 bg-gray-50 rounded-lg shadow-sm flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-lg">{bahan.nama}</p>
                    <p className="text-sm text-gray-500">
                      Rp{" "}
                      {parseInt(bahan.harga_per_satuan).toLocaleString("id-ID")}{" "}
                      / {bahan.satuan}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(bahan)}
                      className="bg-yellow-500 text-white p-2 rounded text-sm hover:bg-yellow-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(bahan.bahan_id)}
                      className="bg-red-500 text-white p-2 rounded text-sm hover:bg-red-600"
                    >
                      Delete
                    </button>
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
