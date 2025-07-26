import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/solid";

const API_URL = "https://pawon-ika-api.onrender.com";

// --- Form Component ---
const FormResep = ({ bahanList, onFormSubmit, closeForm }) => {
  const initialFormState = { nama_menu: "", porsi_per_resep: "", deskripsi: "" };
  const [form, setForm] = useState(initialFormState);
  const initialBahanState = [{ bahan_id: "", jumlah: "" }];
  const [bahanUntukResep, setBahanUntukResep] = useState(initialBahanState);

  const handleFormChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleBahanChange = (index, e) => {
    const newBahan = [...bahanUntukResep];
    newBahan[index][e.target.name] = e.target.value;
    setBahanUntukResep(newBahan);
  };
  const tambahBahanRow = () => setBahanUntukResep([...bahanUntukResep, { bahan_id: "", jumlah: "" }]);
  const hapusBahanRow = (index) => setBahanUntukResep(bahanUntukResep.filter((_, i) => i !== index));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const bahanValid = bahanUntukResep.filter((b) => b.bahan_id && b.jumlah > 0);
    if (bahanValid.length === 0) {
      toast.error("Harap isi minimal satu bahan.");
      return;
    }

    const payload = { ...form, bahan: bahanValid };
    await onFormSubmit(payload);
    setForm(initialFormState);
    setBahanUntukResep(initialBahanState);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg mb-8 border border-gray-200">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Buat Resep Baru</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input name="nama_menu" value={form.nama_menu} onChange={handleFormChange} placeholder="Nama Menu" className="input-field" required />
          <input type="number" name="porsi_per_resep" value={form.porsi_per_resep} onChange={handleFormChange} placeholder="Resep untuk Berapa Porsi?" className="input-field" required />
        </div>
        <textarea name="deskripsi" value={form.deskripsi} onChange={handleFormChange} placeholder="Deskripsi singkat menu" className="input-field w-full"></textarea>
        <h3 className="font-semibold pt-4 border-t mt-4 text-gray-700">Bahan yang Dibutuhkan:</h3>
        {bahanUntukResep.map((item, index) => (
          <div key={index} className="flex gap-2 items-center">
            <select name="bahan_id" value={item.bahan_id} onChange={(e) => handleBahanChange(index, e)} className="input-field w-full" required>
              <option value="">-- Pilih Bahan --</option>
              {bahanList.map((b) => <option key={b.bahan_id} value={b.bahan_id}>{b.nama}</option>)}
            </select>
            <input type="number" step="0.01" name="jumlah" value={item.jumlah} onChange={(e) => handleBahanChange(index, e)} placeholder="Jumlah" className="input-field w-1/3" required />
            {bahanUntukResep.length > 1 && (
              <button type="button" onClick={() => hapusBahanRow(index)} className="p-2 text-red-500 hover:text-red-700">
                <TrashIcon className="h-5 w-5" />
              </button>
            )}
          </div>
        ))}
        <button type="button" onClick={tambahBahanRow} className="text-sm text-blue-600 hover:underline font-medium">+ Tambah Baris Bahan</button>
        <div className="flex justify-end gap-3 pt-4">
          <button type="button" onClick={closeForm} className="btn-secondary">Batal</button>
          <button type="submit" className="btn-primary">Simpan Resep</button>
        </div>
      </form>
    </div>
  );
};

// --- Card Component ---
const ResepCard = ({ resep, onEdit, onDelete }) => (
  <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 ease-in-out">
    <div className="p-6">
      <div className="flex justify-between items-start">
        <div className="flex-grow">
            <h3 className="text-xl font-bold text-gray-800 tracking-wide">{resep.nama_menu}</h3>
            <p className="text-sm text-gray-500">Untuk {resep.porsi_per_resep} porsi</p>
        </div>
        <div className="flex-shrink-0 flex gap-2">
            <Link to={`/resep/${resep.resep_id}/edit`} className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                <PencilIcon className="h-5 w-5" />
            </Link>
            <button onClick={() => onDelete(resep.resep_id)} className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                <TrashIcon className="h-5 w-5" />
            </button>
        </div>
      </div>
      <p className="text-gray-600 mt-4 text-sm">{resep.deskripsi || "Tidak ada deskripsi."}</p>
    </div>
  </div>
);

// --- Main Page Component ---
function ResepPage() {
  const [resepList, setResepList] = useState([]);
  const [bahanList, setBahanList] = useState([]);
  const [isFormVisible, setIsFormVisible] = useState(false);

  const fetchResep = async () => {
    try {
      const res = await fetch(`${API_URL}/api/resep`);
      if (!res.ok) throw new Error("Gagal mengambil data resep");
      setResepList(await res.json());
    } catch (error) {
      toast.error(error.message);
    }
  };

  const fetchBahan = async () => {
    try {
      const res = await fetch(`${API_URL}/api/bahan`);
      if (!res.ok) throw new Error("Gagal mengambil data bahan");
      setBahanList(await res.json());
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchResep();
    fetchBahan();
  }, []);

  const handleFormSubmit = async (payload) => {
    try {
      const response = await fetch(`${API_URL}/api/resep`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("Gagal menyimpan resep");
      toast.success("Resep berhasil disimpan!");
      fetchResep();
      setIsFormVisible(false);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus resep ini?")) {
      try {
        const response = await fetch(`${API_URL}/api/resep/${id}`, { method: "DELETE" });
        if (!response.ok) throw new Error("Gagal menghapus resep");
        toast.success("Resep berhasil dihapus!");
        fetchResep();
      } catch (error) {
        toast.error(error.message);
      }
    }
  };

  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-800">Daftar Resep</h1>
            {!isFormVisible && (
                <button onClick={() => setIsFormVisible(true)} className="btn-primary flex items-center gap-2">
                    <PlusIcon className="h-5 w-5" />
                    Buat Resep Baru
                </button>
            )}
        </div>

        {isFormVisible && <FormResep bahanList={bahanList} onFormSubmit={handleFormSubmit} closeForm={() => setIsFormVisible(false)} />}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resepList.map((resep) => (
                <ResepCard key={resep.resep_id} resep={resep} onDelete={handleDelete} />
            ))}
        </div>
        {resepList.length === 0 && !isFormVisible && (
            <div className="text-center py-10 px-6 bg-white rounded-lg shadow-md">
                <h3 className="text-xl font-medium text-gray-700">Belum Ada Resep</h3>
                <p className="text-gray-500 mt-2">Mulai buat resep pertama Anda dengan menekan tombol 'Buat Resep Baru'.</p>
            </div>
        )}
    </div>
  );
}

export default ResepPage;

