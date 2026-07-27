"use client";

import { useState, useEffect } from "react";

interface Vehicle {
  id: string;
  licensePlate: string;
  vehicleType: string;
  brand: string | null;
  model: string | null;
  color: string | null;
  stickerNumber: string | null;
  status: string;
  createdAt: string;
  resident: { id: string; fullName: string | null } | null;
  household: { id: string; householdNumber: string | null } | null;
}

export default function AdminVehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [search, setSearch] = useState("");
  const [plate, setPlate] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const params = new URLSearchParams();
      if (status) params.set("status", status);
      if (vehicleType) params.set("vehicleType", vehicleType);
      if (search) params.set("search", search);
      if (plate) { params.set("plate", plate); params.delete("status"); params.delete("vehicleType"); params.delete("search"); }
      const res = await fetch(`/api/vehicles?${params}`);
      const data = await res.json();
      if (cancelled) return;
      setVehicles(data.vehicles ?? []);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [status, vehicleType, search, plate]);

  async function action(id: string, act: string) {
    const res = await fetch(`/api/vehicles/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: act }),
    });
    if (res.ok) {
      const params = new URLSearchParams();
      if (status) params.set("status", status);
      if (vehicleType) params.set("vehicleType", vehicleType);
      if (search) params.set("search", search);
      const r = await fetch(`/api/vehicles?${params}`);
      const d = await r.json();
      setVehicles(d.vehicles ?? []);
    }
  }

  const statusColor = (s: string) =>
    s === "ACTIVE" ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400" :
    s === "INACTIVE" ? "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-500" :
    s === "SUSPENDED" ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400" :
    s === "EXPIRED" ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400" :
    "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400";

  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-6">Manajemen Kendaraan</h1>

      <div className="flex gap-3 mb-4 flex-wrap">
        <input placeholder="Cari merek/model..." className="h-10 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 text-sm" value={search} onChange={(e) => { setSearch(e.target.value); setPlate(""); }} />
        <input placeholder="Cari plat nomor..." className="h-10 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 text-sm" value={plate} onChange={(e) => { setPlate(e.target.value); setSearch(""); }} />
        <select className="h-10 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 text-sm" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Semua Status</option>
          <option value="ACTIVE">Aktif</option><option value="INACTIVE">Tidak Aktif</option>
          <option value="SUSPENDED">Ditangguhkan</option><option value="EXPIRED">Kadaluarsa</option>
        </select>
        <select className="h-10 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 text-sm" value={vehicleType} onChange={(e) => setVehicleType(e.target.value)}>
          <option value="">Semua Tipe</option>
          <option value="MOTORCYCLE">Motor</option><option value="CAR">Mobil</option>
          <option value="TRUCK">Truk</option><option value="OTHER">Lainnya</option>
        </select>
      </div>

      {loading ? <div className="py-12 text-center text-zinc-500">Memuat...</div> : vehicles.length === 0 ? (
        <div className="py-12 text-center text-zinc-500">Tidak ada kendaraan.</div>
      ) : (
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
                <th className="text-left px-4 py-3 font-medium text-zinc-500">Plat</th>
                <th className="text-left px-4 py-3 font-medium text-zinc-500">Tipe</th>
                <th className="text-left px-4 py-3 font-medium text-zinc-500">Merek/Model</th>
                <th className="text-left px-4 py-3 font-medium text-zinc-500">Warna</th>
                <th className="text-left px-4 py-3 font-medium text-zinc-500">Pemilik</th>
                <th className="text-left px-4 py-3 font-medium text-zinc-500">Status</th>
                <th className="text-right px-4 py-3 font-medium text-zinc-500">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((v) => (
                <tr key={v.id} className="border-b border-zinc-100 dark:border-zinc-800/50">
                  <td className="px-4 py-3 font-mono font-medium text-zinc-900 dark:text-zinc-50">{v.licensePlate}</td>
                  <td className="px-4 py-3 text-zinc-500 text-xs">
                    {v.vehicleType === "MOTORCYCLE" ? "Motor" : v.vehicleType === "CAR" ? "Mobil" : v.vehicleType === "TRUCK" ? "Truk" : "Lainnya"}
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-500">{[v.brand, v.model].filter(Boolean).join(" ") || "—"}</td>
                  <td className="px-4 py-3 text-xs text-zinc-500">{v.color || "—"}</td>
                  <td className="px-4 py-3 text-xs text-zinc-500">{v.resident?.fullName ?? v.household?.householdNumber ?? "—"}</td>
                  <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded ${statusColor(v.status)}`}>{v.status}</span></td>
                  <td className="px-4 py-3 text-right space-x-2">
                    {v.status === "INACTIVE" && <button onClick={() => action(v.id, "approve")} className="text-xs text-green-600 hover:underline">Aktifkan</button>}
                    {v.status === "ACTIVE" && <button onClick={() => action(v.id, "suspend")} className="text-xs text-red-600 hover:underline">Tangguhkan</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
