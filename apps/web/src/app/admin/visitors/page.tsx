"use client";

import { useState, useEffect } from "react";

interface Visitor {
  id: string;
  name: string;
  licensePlate: string | null;
  visitCode: string;
  status: string;
  validFrom: string;
  validUntil: string;
  checkInAt: string | null;
  checkOutAt: string | null;
  household: { id: string; householdNumber: string | null } | null;
}

export default function AdminVisitorsPage() {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [lookupCode, setLookupCode] = useState("");
  const [lookupResult, setLookupResult] = useState<Visitor | null>(null);
  const [lookupError, setLookupError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await fetch("/api/visitors");
      const data = await res.json();
      if (cancelled) return;
      setVisitors(data.visitors ?? []);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  async function action(id: string, act: string) {
    const res = await fetch(`/api/visitors/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: act }),
    });
    if (res.ok) {
      const r = await fetch("/api/visitors");
      const d = await r.json();
      setVisitors(d.visitors ?? []);
      if (lookupResult?.id === id) setLookupResult(null);
    }
  }

  async function handleLookup() {
    setLookupError("");
    setLookupResult(null);
    const res = await fetch(`/api/visitors/lookup?code=${encodeURIComponent(lookupCode)}`);
    if (!res.ok) {
      const err = await res.json();
      setLookupError(err.error ?? "Kode tidak ditemukan");
      return;
    }
    const data = await res.json();
    setLookupResult(data.visitor);
  }

  const statusColor = (s: string) =>
    s === "PENDING" ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400" :
    s === "APPROVED" ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400" :
    s === "ACTIVE" ? "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400" :
    s === "COMPLETED" ? "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-500" :
    s === "EXPIRED" ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400" :
    "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400";

  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-6">Dashboard Pengunjung</h1>

      {/* Lookup by code */}
      <div className="mb-6 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
        <h2 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Cari Kode Kunjungan</h2>
        <div className="flex gap-2">
          <input
            placeholder="Masukkan kode..."
            className="h-10 flex-1 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 text-sm"
            value={lookupCode}
            onChange={(e) => setLookupCode(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === "Enter" && handleLookup()}
          />
          <button
            onClick={handleLookup}
            className="rounded-lg bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 px-4 py-2 text-sm font-medium"
          >
            Cari
          </button>
        </div>
        {lookupError && <p className="text-xs text-red-600 mt-2">{lookupError}</p>}
        {lookupResult && (
          <div className="mt-3 p-3 rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950">
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{lookupResult.name}</p>
            <p className="text-xs text-zinc-500 mt-1">
              Kode: {lookupResult.visitCode} • Status: {lookupResult.status.replace("_", " ")}
            </p>
            <div className="mt-2 flex gap-2">
              {lookupResult.status === "APPROVED" && !lookupResult.checkInAt && (
                <button onClick={() => { action(lookupResult.id, "check_in"); setLookupResult(null); }} className="text-xs text-blue-600 hover:underline">Check-in</button>
              )}
              {lookupResult.status === "ACTIVE" && (
                <button onClick={() => { action(lookupResult.id, "check_out"); setLookupResult(null); }} className="text-xs text-zinc-600 hover:underline">Check-out</button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Active visitors list */}
      {loading ? (
        <div className="py-12 text-center text-zinc-500">Memuat...</div>
      ) : visitors.length === 0 ? (
        <div className="py-12 text-center text-zinc-500">Tidak ada pengunjung aktif.</div>
      ) : (
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
                <th className="text-left px-4 py-3 font-medium text-zinc-500">Nama</th>
                <th className="text-left px-4 py-3 font-medium text-zinc-500">Kode</th>
                <th className="text-left px-4 py-3 font-medium text-zinc-500">Status</th>
                <th className="text-left px-4 py-3 font-medium text-zinc-500">Warga</th>
                <th className="text-left px-4 py-3 font-medium text-zinc-500">Berlaku</th>
                <th className="text-right px-4 py-3 font-medium text-zinc-500">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {visitors.map((v) => (
                <tr key={v.id} className="border-b border-zinc-100 dark:border-zinc-800/50">
                  <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-50">{v.name}</td>
                  <td className="px-4 py-3 text-xs font-mono text-zinc-500">{v.visitCode}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded ${statusColor(v.status)}`}>{v.status.replace("_", " ")}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-500">{v.household?.householdNumber ?? "—"}</td>
                  <td className="px-4 py-3 text-xs text-zinc-500">
                    {new Date(v.validFrom).toLocaleDateString("id-ID")} – {new Date(v.validUntil).toLocaleDateString("id-ID")}
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    {v.status === "PENDING" && <button onClick={() => action(v.id, "approve")} className="text-xs text-green-600 hover:underline">Setujui</button>}
                    {v.status === "APPROVED" && !v.checkInAt && <button onClick={() => action(v.id, "check_in")} className="text-xs text-blue-600 hover:underline">Check-in</button>}
                    {v.status === "ACTIVE" && <button onClick={() => action(v.id, "check_out")} className="text-xs text-zinc-600 hover:underline">Check-out</button>}
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