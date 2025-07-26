import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { CalculatorIcon, CurrencyDollarIcon, ReceiptPercentIcon, ScaleIcon, ChartBarIcon, BanknotesIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";

const API_URL = "https://pawon-ika-api.onrender.com";

const bulatkanHarga = (harga, kelipatan = 500) => Math.ceil(harga / kelipatan) * kelipatan;

const formatRupiah = (angka) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);

const MetricCard = ({ title, value, icon, color, isLoading }) => {
  const Icon = icon;
  return (
    <div className={`bg-white p-4 rounded-xl shadow-md flex items-center gap-4 border-l-4 ${color}`}>
      <Icon className="h-8 w-8 text-gray-500" />
      <div>
        <p className="text-sm text-gray-600">{title}</p>
        {isLoading ? <div className="h-7 w-24 bg-gray-200 rounded animate-pulse"></div> : <p className="text-2xl font-bold text-gray-800">{value}</p>}
      </div>
    </div>
  );
};

function KalkulatorPage() {
  const [resepList, setResepList] = useState([]);
  const [selectedResepId, setSelectedResepId] = useState("");
  const [detailResep, setDetailResep] = useState(null);
  const [jumlahPesanan, setJumlahPesanan] = useState(1);
  const [margin, setMargin] = useState(70);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchResep = async () => {
      try {
        const res = await fetch(`${API_URL}/api/resep`);
        if (!res.ok) throw new Error("Gagal memuat daftar resep");
        setResepList(await res.json());
      } catch (error) {
        toast.error(error.message);
      }
    };
    fetchResep();
  }, []);

  useEffect(() => {
    if (!selectedResepId) {
      setDetailResep(null);
      return;
    }
    const fetchDetail = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`${API_URL}/api/resep/${selectedResepId}`);
        if (!res.ok) throw new Error("Gagal memuat detail resep");
        setDetailResep(await res.json());
      } catch (error) {
        toast.error(error.message);
        setDetailResep(null);
      }
      setIsLoading(false);
    };
    fetchDetail();
  }, [selectedResepId]);

  const hppPerPorsi = detailResep?.hpp_per_porsi || 0;
  const hargaJualKalkulasi = hppPerPorsi * (1 + margin / 100);
  const hargaJualRekomendasi = bulatkanHarga(hargaJualKalkulasi);
  const profitPerPorsi = hargaJualRekomendasi - hppPerPorsi;
  const totalHppPesanan = hppPerPorsi * jumlahPesanan;
  const totalOmzet = hargaJualRekomendasi * jumlahPesanan;
  const totalProfit = profitPerPorsi * jumlahPesanan;

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <CalculatorIcon className="h-8 w-8 text-gray-700" />
        <h1 className="text-3xl font-bold text-gray-800">Kalkulator HPP & Harga Jual</h1>
      </div>

      {/* Input Card */}
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          <div className="lg:col-span-1">
            <label htmlFor="resep-select" className="block text-sm font-medium text-gray-700 mb-1">Pilih Resep Menu</label>
            <select id="resep-select" value={selectedResepId} onChange={(e) => setSelectedResepId(e.target.value)} className="input-field w-full">
              <option value="">-- Silakan Pilih --</option>
              {resepList.map((r) => <option key={r.resep_id} value={r.resep_id}>{r.nama_menu}</option>)}
            </select>
          </div>
          <div className="lg:col-span-2">
            <label htmlFor="margin-profit" className="block text-sm font-medium text-gray-700 mb-1">Margin Keuntungan: <span className="font-bold text-green-600">{margin}%</span></label>
            <input id="margin-profit" type="range" min="10" max="200" step="5" value={margin} onChange={(e) => setMargin(parseInt(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600" disabled={!selectedResepId} />
          </div>
        </div>
      </div>

      {/* Results Section */}
      {selectedResepId ? (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-800">Hasil Kalkulasi untuk <span className="text-green-600">{detailResep?.nama_menu}</span></h2>
          
          {/* Per Porsi Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <MetricCard title="HPP per Porsi" value={formatRupiah(hppPerPorsi)} icon={ScaleIcon} color="border-red-500" isLoading={isLoading} />
            <MetricCard title="Rekomendasi Harga Jual" value={formatRupiah(hargaJualRekomendasi)} icon={CurrencyDollarIcon} color="border-green-500" isLoading={isLoading} />
            <MetricCard title="Estimasi Profit per Porsi" value={formatRupiah(profitPerPorsi)} icon={ChartBarIcon} color="border-blue-500" isLoading={isLoading} />
          </div>

          {/* Order Calculation */}
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Kalkulasi Pesanan</h3>
            <div className="flex items-center gap-4 mb-6">
              <label htmlFor="jumlah-pesanan" className="text-sm font-medium text-gray-700">Jumlah Pesanan (Porsi):</label>
              <div className="flex items-center gap-2">
                <button onClick={() => setJumlahPesanan(p => Math.max(1, p - 1))} className="btn-secondary px-3 py-1">-</button>
                <input id="jumlah-pesanan" type="number" min="1" value={jumlahPesanan} onChange={(e) => setJumlahPesanan(Math.max(1, parseInt(e.target.value) || 1))} className="input-field w-20 text-center" />
                <button onClick={() => setJumlahPesanan(p => p + 1)} className="btn-secondary px-3 py-1">+</button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <MetricCard title="Total Omzet" value={formatRupiah(totalOmzet)} icon={BanknotesIcon} color="border-indigo-500" isLoading={isLoading} />
                <MetricCard title="Total HPP" value={formatRupiah(totalHppPesanan)} icon={ScaleIcon} color="border-red-500" isLoading={isLoading} />
                <MetricCard title="Total Profit" value={formatRupiah(totalProfit)} icon={ChartBarIcon} color="border-blue-500" isLoading={isLoading} />
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-10 px-6 bg-white rounded-lg shadow-md border border-gray-200">
          <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-xl font-medium text-gray-800">Pilih Resep</h3>
          <p className="mt-1 text-sm text-gray-500">Silakan pilih resep dari menu di atas untuk memulai kalkulasi.</p>
        </div>
      )}
    </div>
  );
}

export default KalkulatorPage;

