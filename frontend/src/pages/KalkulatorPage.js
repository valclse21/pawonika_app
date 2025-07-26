// frontend/src/pages/KalkulatorPage.js

import React, { useState, useEffect } from "react";

const API_URL = "http://localhost:5000";

// Fungsi bantuan untuk membulatkan ke kelipatan terdekat (misal: 500 atau 1000)
const bulatkanHarga = (harga, kelipatan = 500) => {
  return Math.ceil(harga / kelipatan) * kelipatan;
};

function KalkulatorPage() {
  const [resepList, setResepList] = useState([]);
  const [selectedResepId, setSelectedResepId] = useState("");
  const [detailResep, setDetailResep] = useState(null);
  const [jumlahPesanan, setJumlahPesanan] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // --- FITUR BARU ---
  const [margin, setMargin] = useState(70); // Default margin keuntungan 70%

  useEffect(() => {
    const fetchResep = async () => {
      const res = await fetch(`${API_URL}/api/resep`);
      setResepList(await res.json());
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
      const res = await fetch(`${API_URL}/api/resep/${selectedResepId}`);
      setDetailResep(await res.json());
      setIsLoading(false);
    };
    fetchDetail();
  }, [selectedResepId]);

  // --- KALKULASI BARU ---
  const hppPerPorsi = detailResep?.hpp_per_porsi || 0;
  const hargaJualKalkulasi = hppPerPorsi * (1 + margin / 100);
  const hargaJualRekomendasi = bulatkanHarga(hargaJualKalkulasi);
  const profitPerPorsi = hargaJualRekomendasi - hppPerPorsi;
  const totalHppPesanan = hppPerPorsi * jumlahPesanan;
  const totalOmzet = hargaJualRekomendasi * jumlahPesanan;
  const totalProfit = profitPerPorsi * jumlahPesanan;

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-4 border-b pb-2">
        Kalkulator HPP & Harga Jual
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Kolom Kiri: Input */}
        <div>
          <label
            htmlFor="resep-select"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Pilih Resep Menu:
          </label>
          <select
            id="resep-select"
            value={selectedResepId}
            onChange={(e) => setSelectedResepId(e.target.value)}
            className="p-3 border rounded-md w-full bg-gray-50 focus:ring-2 focus:ring-green-500"
          >
            <option value="">-- Silakan Pilih Menu --</option>
            {resepList.map((r) => (
              <option key={r.resep_id} value={r.resep_id}>
                {r.nama_menu}
              </option>
            ))}
          </select>

          {detailResep && (
            <>
              <div className="mt-4">
                <label
                  htmlFor="jumlah-pesanan"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Jumlah Pesanan (Porsi):
                </label>
                <input
                  id="jumlah-pesanan"
                  type="number"
                  min="1"
                  value={jumlahPesanan}
                  onChange={(e) =>
                    setJumlahPesanan(Math.max(1, parseInt(e.target.value)))
                  }
                  className="p-3 border rounded-md w-full"
                />
              </div>

              <div className="mt-4">
                <label
                  htmlFor="margin-profit"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Margin Keuntungan (%):
                </label>
                <input
                  id="margin-profit"
                  type="number"
                  min="0"
                  value={margin}
                  onChange={(e) => setMargin(parseInt(e.target.value) || 0)}
                  className="p-3 border rounded-md w-full"
                />
              </div>
            </>
          )}
        </div>

        {/* Kolom Kanan: Hasil Kalkulasi */}
        <div>
          {isLoading && (
            <p className="text-center text-gray-500 pt-10">
              Menghitung detail...
            </p>
          )}
          {detailResep && !isLoading && (
            <div className="p-5 border-2 border-dashed border-green-300 rounded-lg bg-green-50 space-y-4">
              <h3 className="text-xl font-bold text-gray-800">
                {detailResep.nama_menu}
              </h3>

              <div>
                <p className="text-sm text-gray-600">HPP per Porsi</p>
                <p className="text-2xl font-bold text-red-600">
                  Rp {Math.ceil(hppPerPorsi).toLocaleString("id-ID")}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600">
                  Rekomendasi Harga Jual (Margin {margin}%)
                </p>
                <p className="text-2xl font-bold text-green-700">
                  Rp {hargaJualRekomendasi.toLocaleString("id-ID")}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600">
                  Estimasi Profit per Porsi
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  Rp {Math.floor(profitPerPorsi).toLocaleString("id-ID")}
                </p>
              </div>

              <div className="mt-4 pt-4 border-t">
                <p className="font-semibold">
                  Estimasi Pesanan ({jumlahPesanan} porsi):
                </p>
                <p className="text-sm">
                  Total Omzet:{" "}
                  <span className="font-bold">
                    Rp {totalOmzet.toLocaleString("id-ID")}
                  </span>
                </p>
                <p className="text-sm">
                  Total HPP:{" "}
                  <span className="font-bold">
                    Rp {Math.ceil(totalHppPesanan).toLocaleString("id-ID")}
                  </span>
                </p>
                <p className="text-sm">
                  Total Profit:{" "}
                  <span className="font-bold">
                    Rp {Math.floor(totalProfit).toLocaleString("id-ID")}
                  </span>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default KalkulatorPage;
