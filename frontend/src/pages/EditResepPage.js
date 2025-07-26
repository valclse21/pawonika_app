import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { TrashIcon, ArrowLeftIcon } from "@heroicons/react/24/solid";

const API_URL = "https://pawon-ika-api.onrender.com";

function EditResepPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [bahanList, setBahanList] = useState([]);
  const [form, setForm] = useState(null);
  const [bahanUntukResep, setBahanUntukResep] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) {
      setIsLoading(false);
      setError("ID Resep tidak valid.");
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      setError("");
      try {
        const [bahanRes, resepRes] = await Promise.all([
          fetch(`${API_URL}/api/bahan`),
          fetch(`${API_URL}/api/resep/${id}`),
        ]);

        if (!bahanRes.ok) throw new Error("Gagal memuat data bahan baku.");
        if (!resepRes.ok) throw new Error(`Resep dengan ID ${id} tidak ditemukan.`);

        const bahanData = await bahanRes.json();
        const resepData = await resepRes.json();

        setBahanList(bahanData);
        setForm({
          nama_menu: resepData.nama_menu,
          porsi_per_resep: resepData.porsi_per_resep,
          deskripsi: resepData.deskripsi || "",
        });
        setBahanUntukResep(
          Array.isArray(resepData.bahan) ? resepData.bahan.map((b) => ({ bahan_id: b.bahan_id, jumlah: b.jumlah })) : []
        );
      } catch (err) {
        setError(err.message);
        toast.error(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id]);

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

    try {
      const response = await fetch(`${API_URL}/api/resep/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("Gagal memperbarui resep.");
      toast.success("Resep berhasil diperbarui!");
      navigate("/resep");
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (isLoading) return <div className="text-center p-10">Memuat data resep...</div>;
  if (error) return <div className="text-center p-10 text-red-500">Error: {error}</div>;
  if (!form) return <div className="text-center p-10">Tidak ada data resep untuk ditampilkan.</div>;

  return (
    <div className="space-y-6">
        <Link to="/resep" className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900">
            <ArrowLeftIcon className="h-4 w-4" />
            Kembali ke Daftar Resep
        </Link>
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Edit Resep: <span className="text-green-600">{form.nama_menu}</span></h2>
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
                    <button type="button" onClick={() => navigate('/resep')} className="btn-secondary">Batal</button>
                    <button type="submit" className="btn-primary">Simpan Perubahan</button>
                </div>
            </form>
        </div>
    </div>
  );
}

export default EditResepPage;

