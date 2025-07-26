// frontend/src/App.js

import React from "react";
import { Routes, Route, NavLink } from "react-router-dom";
import { Toaster } from "react-hot-toast"; // <-- Import untuk notifikasi

import BahanBakuPage from "./pages/BahanBakuPage";
import ResepPage from "./pages/ResepPage";
import KalkulatorPage from "./pages/KalkulatorPage";
import EditResepPage from "./pages/EditResepPage";

function App() {
  const activeLinkStyle = {
    backgroundColor: "#16a34a", // green-600
    color: "white",
  };

  return (
    <div className="bg-gray-100 min-h-screen font-sans">
      {/* Komponen Toaster agar notifikasi bisa muncul di semua halaman */}
      <Toaster position="top-center" reverseOrder={false} />

      <header className="bg-white shadow-md sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row justify-between items-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2 sm:mb-0">
            🍛 APLIKASI HITUNG HPP
          </h1>
          <nav className="flex space-x-2 sm:space-x-4 bg-gray-200 p-1 rounded-lg">
            <NavLink
              to="/"
              style={({ isActive }) => (isActive ? activeLinkStyle : undefined)}
              className="px-3 py-2 rounded-md text-sm sm:text-base font-medium text-gray-700 hover:bg-gray-300"
            >
              Kalkulator
            </NavLink>
            <NavLink
              to="/resep"
              style={({ isActive }) => (isActive ? activeLinkStyle : undefined)}
              className="px-3 py-2 rounded-md text-sm sm:text-base font-medium text-gray-700 hover:bg-gray-300"
            >
              Resep
            </NavLink>
            <NavLink
              to="/bahan"
              style={({ isActive }) => (isActive ? activeLinkStyle : undefined)}
              className="px-3 py-2 rounded-md text-sm sm:text-base font-medium text-gray-700 hover:bg-gray-300"
            >
              Bahan Baku
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="container mx-auto p-4 sm:p-6">
        <Routes>
          <Route path="/" element={<KalkulatorPage />} />
          <Route path="/resep" element={<ResepPage />} />
          <Route path="/resep/:id/edit" element={<EditResepPage />} />
          <Route path="/bahan" element={<BahanBakuPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
