"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewVehiclePage() {
  const router = useRouter();
  const [licensePlate, setLicensePlate] = useState("");
  const [vehicleType, setVehicleType] = useState("MOTORCYCLE");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [color, setColor] = useState("");
  const [stickerNumber, setStickerNumber] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const res = await fetch("/api/vehicles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        licensePlate,
        vehicleType,
        brand: brand || undefined,
        model: model || undefined,
        color: color || undefined,
        stickerNumber: stickerNumber || undefined,
      }),
    });

    setSubmitting(false);

    if (res.ok) {
      router.push("/resident/vehicles");
    } else {
      const data = await res.json();
      setError(data.error ?? "Gagal mendaftarkan kendaraan");
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-6">Daftarkan Kendaraan</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Plat Nomor *</label>
          <input
            className="w-full h-10 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 text-sm"
            value={licensePlate}
            onChange={(e) => setLicensePlate(e.target.value.toUpperCase())}
            placeholder="B 1234 XYZ"
            required
            maxLength={15}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Tipe Kendaraan *</label>
          <select
            className="w-full h-10 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 text-sm"
            value={vehicleType}
            onChange={(e) => setVehicleType(e.target.value)}
          >
            <option value="MOTORCYCLE">Motor</option>
            <option value="CAR">Mobil</option>
            <option value="TRUCK">Truk</option>
            <option value="OTHER">Lainnya</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Merek</label>
            <input
              className="w-full h-10 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 text-sm"
              value={brand} onChange={(e) => setBrand(e.target.value)}
              placeholder="Toyota"
              maxLength={50}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Model</label>
            <input
              className="w-full h-10 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 text-sm"
              value={model} onChange={(e) => setModel(e.target.value)}
              placeholder="Avanza"
              maxLength={50}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Warna</label>
          <input
            className="w-full h-10 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 text-sm"
            value={color} onChange={(e) => setColor(e.target.value)}
            placeholder="Putih"
            maxLength={30}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Nomor Stiker</label>
          <input
            className="w-full h-10 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 text-sm"
            value={stickerNumber} onChange={(e) => setStickerNumber(e.target.value)}
            placeholder="STK-001"
            maxLength={30}
          />
        </div>

        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 px-4 py-2 text-sm font-medium disabled:opacity-50"
        >
          {submitting ? "Menyimpan..." : "Daftarkan"}
        </button>
      </form>
    </div>
  );
}
