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

interface CreateData {
  recipientName: string;
  householdId?: string;
  residentialUnitId?: string;
  courier?: string;
}

export default function AdminPackagesPage() {
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");

  // Create modal state
  const [showCreate, setShowCreate] = useState(false);
  const [createData, setCreateData] = useState<CreateData>({ recipientName: "" });

  const fetchPackages = () => {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (search) params.set("search", search);
    fetch(`/api/packages?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setPackages(data.packages ?? []);
        setLoading(false);
      });
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const params = new URLSearchParams();
      if (status) params.set("status", status);
      if (search) params.set("search", search);
      const res = await fetch(`/api/packages?${params}`);
      const data = await res.json();
      if (cancelled) return;
      setPackages(data.packages ?? []);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [status, search]);

  async function action(id: string, act: string, extra?: Record<string, unknown>) {
    const res = await fetch(`/api/packages/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: act, ...extra }),
    });
    if (res.ok) fetchPackages();
  }

  async function handleCreate() {
    if (!createData.recipientName.trim()) return;
    const res = await fetch("/api/packages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(createData),
    });
    if (res.ok) {
      setShowCreate(false);
      setCreateData({ recipientName: "" });
      fetchPackages();
    } else {
      const err = await res.json();
      alert(err.error || "Gagal membuat paket");
    }
  }

  const statusColor = (s: string) =>
    s === "ARRIVED" ? "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400" :
    s === "NOTIFIED" ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400" :
    s === "PICKED_UP" ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400" :
    s === "RETURNED" ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400" :
    s === "EXPIRED" ? "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-500" :
    "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400";

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Manajemen Paket</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="rounded-lg bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 px-4 py-2 text-sm font-medium"
        >
          + Catat Paket
        </button>
      </div>

      <div className="flex gap-3 mb-4 flex-wrap">
        <input
          placeholder="Cari penerima atau kurir..."
          className="h-10 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 text-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="h-10 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 text-sm"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">Semua Status</option>
          <option value="ARRIVED">Tiba</option>
          <option value="NOTIFIED">Diberitahu</option>
          <option value="PICKED_UP">Diambil</option>
          <option value="RETURNED">Dikembalikan</option>
          <option value="EXPIRED">Kadaluarsa</option>
        </select>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="rounded-xl bg-white dark:bg-zinc-900 p-6 w-full max-w-md border border-zinc-200 dark:border-zinc-800">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-4">Catat Paket Baru</h2>
            <div className="space-y-3">
              <input
                placeholder="Nama penerima *"
                className="w-full h-10 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 text-sm"
                value={createData.recipientName}
                onChange={(e) => setCreateData({ ...createData, recipientName: e.target.value })}
              />
              <input
                placeholder="ID Unit (opsional)"
                className="w-full h-10 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 text-sm"
                value={createData.residentialUnitId ?? ""}
                onChange={(e) => setCreateData({ ...createData, residentialUnitId: e.target.value })}
              />
              <input
                placeholder="ID Rumah Tangga (opsional)"
                className="w-full h-10 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 text-sm"
                value={createData.householdId ?? ""}
                onChange={(e) => setCreateData({ ...createData, householdId: e.target.value })}
              />
              <input
                placeholder="Kurir (opsional)"
                className="w-full h-10 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 text-sm"
                value={createData.courier ?? ""}
                onChange={(e) => setCreateData({ ...createData, courier: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => { setShowCreate(false); setCreateData({ recipientName: "" }); }}
                className="px-4 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400"
              >
                Batal
              </button>
              <button
                onClick={handleCreate}
                className="px-4 py-2 text-sm rounded-lg bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 font-medium"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="py-12 text-center text-zinc-500">Memuat...</div>
      ) : packages.length === 0 ? (
        <div className="py-12 text-center text-zinc-500">Tidak ada paket.</div>
      ) : (
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
                <th className="text-left px-4 py-3 font-medium text-zinc-500">Penerima</th>
                <th className="text-left px-4 py-3 font-medium text-zinc-500">Kurir</th>
                <th className="text-left px-4 py-3 font-medium text-zinc-500">Status</th>
                <th className="text-left px-4 py-3 font-medium text-zinc-500">Tiba</th>
                <th className="text-left px-4 py-3 font-medium text-zinc-500">Diambil</th>
                <th className="text-right px-4 py-3 font-medium text-zinc-500">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {packages.map((p) => (
                <tr key={p.id} className="border-b border-zinc-100 dark:border-zinc-800/50">
                  <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-50">
                    {p.recipientName}
                    {p.household && <span className="ml-2 text-xs text-zinc-400">({p.household.householdNumber})</span>}
                  </td>
                  <td className="px-4 py-3 text-zinc-500 text-xs">{p.courier ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded ${statusColor(p.status)}`}>
                      {p.status === "ARRIVED" ? "Tiba" :
                       p.status === "NOTIFIED" ? "Diberitahu" :
                       p.status === "PICKED_UP" ? "Diambil" :
                       p.status === "RETURNED" ? "Dikembalikan" :
                       p.status === "EXPIRED" ? "Kadaluarsa" : p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-500">
                    {new Date(p.arrivalAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-500">
                    {p.pickupAt ? new Date(p.pickupAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "—"}
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    {p.status === "ARRIVED" && (
                      <button onClick={() => action(p.id, "notify")} className="text-xs text-amber-600 hover:underline">
                        Beritahu
                      </button>
                    )}
                    {p.status === "NOTIFIED" && (
                      <button onClick={() => action(p.id, "pickup")} className="text-xs text-green-600 hover:underline">
                        Ambil
                      </button>
                    )}
                    {["ARRIVED", "NOTIFIED"].includes(p.status) && (
                      <button onClick={() => { const r = prompt("Alasan pengembalian?"); action(p.id, "return", { reason: r || undefined }); }} className="text-xs text-red-600 hover:underline">
                        Kembalikan
                      </button>
                    )}
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