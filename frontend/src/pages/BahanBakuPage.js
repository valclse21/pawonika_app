// frontend/src/pages/BahanBakuPage.js (Desain Baru)
import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  PencilIcon,
  TrashIcon,
  PlusCircleIcon,
  MinusCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/solid";

const API_URL = "https://pawon-ika-api.onrender.com";

// Komponen Kartu Bahan Baku (Tampilan Utama)
const BahanCard = ({ bahan, onEdit, onDelete, onStokUpdate }) => {
  const [stokChange, setStokChange] = useState("");

  const handleStokAction = (action) => {
    const amount = parseFloat(stokChange);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Masukkan jumlah stok yang valid.");
      return;
    }
    const finalAmount = action === 'add' ? amount : -amount;
    onStokUpdate(bahan.bahan_id, finalAmount);
    setStokChange("");
  };

  const getStokInfo = (stok) => {
    if (stok <= 10) return { text: "Stok Menipis", color: "text-red-500 bg-red-100" };
    if (stok <= 50) return { text: "Stok Cukup", color: "text-yellow-500 bg-yellow-100" };
    return { text: "Stok Aman", color: "text-green-500 bg-green-100" };
  };

  const stokInfo = getStokInfo(bahan.jumlah_stok);

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden transform hover:scale-105 transition-transform duration-300 ease-in-out">
      <div className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xl font-bold text-gray-800">{bahan.nama}</p>
            <p className="text-gray-600">
              Rp {parseInt(bahan.harga_per_satuan).toLocaleString("id-ID")} / {bahan.satuan}
            </p>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-semibold ${stokInfo.color}`}>
            {stokInfo.text}
          </div>
        </div>

        <div className="mt-4 flex justify-between items-center">
            <p className="text-3xl font-bold text-gray-900">{parseFloat(bahan.jumlah_stok).toLocaleString("id-ID")}</p>
            <div className="flex items-center gap-2">
                <input 
                    type="number" 
                    value={stokChange}
                    onChange={(e) => setStokChange(e.target.value)}
                    placeholder="Jumlah"
                    className="w-24 p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 transition"
                />
                <button onClick={() => handleStokAction('add')} className="text-green-500 hover:text-green-700"><PlusCircleIcon className="h-8 w-8"/></button>
                <button onClick={() => handleStokAction('subtract')} className="text-red-500 hover:text-red-700"><MinusCircleIcon className="h-8 w-8"/></button>
            </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
            <button onClick={() => onEdit(bahan)} className="p-2 text-gray-500 hover:text-indigo-600 transition"><PencilIcon className="h-6 w-6"/></button>
            <button onClick={() => onDelete(bahan.bahan_id)} className="p-2 text-gray-500 hover:text-red-600 transition"><TrashIcon className="h-6 w-6"/></button>
        </div>
      </div>
    </div>
  );
};

// Komponen Form Edit
const EditFormCard = ({ bahan, onSave, onCancel }) => {
    const [editForm, setEditForm] = useState(bahan);
    const handleFormChange = (e) => setEditForm({ ...editForm, [e.target.name]: e.target.value });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(editForm);
    }

    return (
        <div className="bg-indigo-50 rounded-xl shadow-lg p-6 border-2 border-indigo-500">
            <form onSubmit={handleSubmit} className="space-y-4">
                <p className="text-xl font-bold text-gray-800">Edit: {bahan.nama}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input name="nama" value={editForm.nama} onChange={handleFormChange} placeholder="Nama Bahan" className="p-3 border rounded-lg w-full" required />
                    <input name="satuan" value={editForm.satuan} onChange={handleFormChange} placeholder="Satuan" className="p-3 border rounded-lg w-full" required />
                    <input type="number" name="harga_per_satuan" value={editForm.harga_per_satuan} onChange={handleFormChange} placeholder="Harga" className="p-3 border rounded-lg w-full" required />
                    <input type="number" name="jumlah_stok" value={editForm.jumlah_stok} onChange={handleFormChange} placeholder="Jumlah Stok" className="p-3 border rounded-lg w-full" required />
                </div>
                <div className="flex justify-end gap-3 mt-4">
                    <button type="submit" className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"><CheckCircleIcon className="h-5 w-5"/>Simpan</button>
                    <button type="button" onClick={onCancel} className="flex items-center gap-2 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition"><XCircleIcon className="h-5 w-5"/>Batal</button>
                </div>
            </form>
        </div>
    );
}

function BahanBakuPage() {
  const [bahanList, setBahanList] = useState([]);
  const initialFormState = { nama: "", satuan: "", harga_per_satuan: "", jumlah_stok: "0" };
  const [form, setForm] = useState(initialFormState);
  const [isEditing, setIsEditing] = useState(null);

  const fetchBahan = async () => {
    try {
      const response = await fetch(`${API_URL}/api/bahan`);
      if (!response.ok) throw new Error("Gagal mengambil data dari server.");
      const data = await response.json();
      setBahanList(data);
    } catch (error) {
      toast.error(error.message || "Gagal memuat daftar bahan.");
    }
  };

  useEffect(() => { fetchBahan(); }, []);

  const handleFormChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

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
      error: (err) => err.message,
    });

    promise.then(() => {
      setForm(initialFormState);
      fetchBahan();
    }).catch(console.error);
  };

  const handleUpdate = async (updatedBahan) => {
    const promise = fetch(`${API_URL}/api/bahan/${updatedBahan.bahan_id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedBahan),
    }).then((res) => {
      if (!res.ok) throw new Error("Gagal memperbarui bahan.");
    });

    toast.promise(promise, {
      loading: "Memperbarui...",
      success: "Bahan berhasil diperbarui!",
      error: (err) => err.message,
    });

    promise.then(() => {
      setIsEditing(null);
      fetchBahan();
    }).catch(console.error);
  };

  const handleDelete = (id) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus bahan ini?")) return;
    const promise = fetch(`${API_URL}/api/bahan/${id}`, { method: "DELETE" }).then((res) => {
      if (!res.ok) throw new Error("Gagal menghapus bahan.");
    });
    toast.promise(promise, { loading: "Menghapus...", success: "Bahan berhasil dihapus!", error: (err) => err.message });
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
    toast.promise(promise, { loading: "Memperbarui stok...", success: "Stok berhasil diperbarui!", error: (err) => err.message });
    promise.then(fetchBahan).catch(console.error);
  };

  return (
    <div className="space-y-8 p-4 md:p-8">
      {/* Form Tambah Bahan Baru */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Tambah Bahan Baku Baru</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-end">
          <input name="nama" value={form.nama} onChange={handleFormChange} placeholder="Nama Bahan" className="p-3 border rounded-lg w-full lg:col-span-2" required />
          <input name="satuan" value={form.satuan} onChange={handleFormChange} placeholder="Satuan (kg, pcs)" className="p-3 border rounded-lg w-full" required />
          <input type="number" name="harga_per_satuan" value={form.harga_per_satuan} onChange={handleFormChange} placeholder="Harga" className="p-3 border rounded-lg w-full" required />
          <input type="number" name="jumlah_stok" value={form.jumlah_stok} onChange={handleFormChange} placeholder="Stok Awal" className="p-3 border rounded-lg w-full" required />
          <button type="submit" className="bg-indigo-600 text-white p-3 rounded-lg hover:bg-indigo-700 w-full font-semibold transition">
            + Tambah
          </button>
        </form>
      </div>

      {/* Daftar Bahan Baku */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Daftar Bahan Baku</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {bahanList.map((bahan) => (
            <div key={bahan.bahan_id}>
              {isEditing === bahan.bahan_id ? (
                <EditFormCard bahan={bahan} onSave={handleUpdate} onCancel={() => setIsEditing(null)} />
              ) : (
                <BahanCard bahan={bahan} onEdit={() => setIsEditing(bahan.bahan_id)} onDelete={handleDelete} onStokUpdate={handleStokUpdate} />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default BahanBakuPage;
