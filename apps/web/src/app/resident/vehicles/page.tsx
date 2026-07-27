"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Vehicle {
  id: string;
  licensePlate: string;
  vehicleType: string;
  brand: string | null;
  model: string | null;
  color: string | null;
  stickerNumber: string | null;
  status: string;
  validFrom: string;
  validUntil: string | null;
  createdAt: string;
  resident: { id: string; fullName: string | null } | null;
  household: { id: string; householdNumber: string | null } | null;
}

export default function ResidentVehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await fetch("/api/vehicles");
      const data = await res.json();
      if (cancelled) return;
      setVehicles(data.vehicles ?? []);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  const statusColor = (s: string) =>
    s === "ACTIVE" ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400" :
    s === "INACTIVE" ? "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-500" :
    s === "SUSPENDED" ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400" :
    s === "EXPIRED" ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400" :
    "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400";

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Kendaraan Saya</h1>
        <Link href="/resident/vehicles/new" className="rounded-lg bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 px-4 py-2 text-sm font-medium">+ Daftarkan Kendaraan</Link>
      </div>

      {loading ? <div className="py-12 text-center text-zinc-500">Memuat...</div> : vehicles.length === 0 ? (
        <div className="py-12 text-center text-zinc-500">Belum ada kendaraan terdaftar.</div>
      ) : (
        <ul className="space-y-3">
          {vehicles.map((v) => (
            <li key={v.id}>
              <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-mono font-medium text-zinc-900 dark:text-zinc-50">{v.licensePlate}</h3>
                    <p className="text-xs text-zinc-400 mt-1">
                      {v.vehicleType === "MOTORCYCLE" ? "Motor" : v.vehicleType === "CAR" ? "Mobil" : v.vehicleType === "TRUCK" ? "Truk" : "Lainnya"}
                      {v.brand ? ` • ${v.brand}` : ""}{v.model ? ` ${v.model}` : ""}{v.color ? ` (${v.color})` : ""}
                    </p>
                    {v.stickerNumber && <p className="text-xs text-zinc-400">Stiker: {v.stickerNumber}</p>}
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded ${statusColor(v.status)}`}>{v.status}</span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
