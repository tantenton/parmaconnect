"use client";

import { useState, useEffect } from "react";

interface PackageItem {
  id: string;
  recipientName: string;
  courier: string | null;
  arrivalAt: string;
  pickupAt: string | null;
  status: string;
  household: { id: string; householdNumber: string } | null;
}

export default function ResidentPackagesPage() {
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await fetch("/api/packages");
      const data = await res.json();
      if (cancelled) return;
      setPackages(data.packages ?? []);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  const statusColor = (s: string) =>
    s === "ARRIVED" ? "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400" :
    s === "NOTIFIED" ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400" :
    s === "PICKED_UP" ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400" :
    s === "RETURNED" ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400" :
    s === "EXPIRED" ? "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-500" :
    "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400";

  const statusLabel = (s: string) =>
    s === "ARRIVED" ? "Tiba" :
    s === "NOTIFIED" ? "Diberitahu" :
    s === "PICKED_UP" ? "Diambil" :
    s === "RETURNED" ? "Dikembalikan" :
    s === "EXPIRED" ? "Kadaluarsa" : s;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Paket Saya</h1>
      </div>

      {loading ? (
        <div className="py-12 text-center text-zinc-500">Memuat...</div>
      ) : packages.length === 0 ? (
        <div className="py-12 text-center text-zinc-500">Belum ada paket.</div>
      ) : (
        <ul className="space-y-3">
          {packages.map((p) => (
            <li key={p.id}>
              <div className="block rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{p.recipientName}</h3>
                    <p className="text-xs text-zinc-400 mt-1">
                      {p.courier ? `${p.courier} • ` : ""}
                      {new Date(p.arrivalAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </p>
                    {p.pickupAt && (
                      <p className="text-xs text-green-600 mt-1">
                        Diambil {new Date(p.pickupAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    )}
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded ${statusColor(p.status)}`}>
                    {statusLabel(p.status)}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}