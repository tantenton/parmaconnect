"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Report {
  id: string; title: string; category: string; priority: string; status: string;
  isPublic: boolean; createdAt: string;
  reporter: { id: string; name: string | null; role: string } | null;
  assignedStaff: { id: string; name: string | null; role: string } | null;
  _count?: { timeline: number };
}

export default function AdminReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const params = new URLSearchParams();
      if (status) params.set("status", status);
      if (category) params.set("category", category);
      if (search) params.set("search", search);
      const res = await fetch(`/api/reports?${params}`);
      const data = await res.json();
      if (cancelled) return;
      setReports(data.reports ?? []);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [status, category, search]);

  async function action(id: string, act: string, extra?: Record<string, unknown>) {
    const res = await fetch(`/api/reports/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: act, ...extra }),
    });
    if (res.ok) {
      const params = new URLSearchParams();
      if (status) params.set("status", status);
      if (category) params.set("category", category);
      const r = await fetch(`/api/reports?${params}`);
      const d = await r.json();
      setReports(d.reports ?? []);
    }
  }

  const statusColor = (s: string) =>
    s === "NEW" ? "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400" :
    s === "VERIFIED" ? "bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-400" :
    s === "ASSIGNED" ? "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400" :
    s === "IN_PROGRESS" ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400" :
    s === "RESOLVED" ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400" :
    s === "CLOSED" ? "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-500" :
    "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400";

  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-6">Antrian Laporan</h1>

      <div className="flex gap-3 mb-4 flex-wrap">
        <input placeholder="Cari..." className="h-10 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 text-sm" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="h-10 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 text-sm" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Semua Status</option>
          <option value="NEW">Baru</option><option value="VERIFIED">Diverifikasi</option>
          <option value="ASSIGNED">Ditugaskan</option><option value="IN_PROGRESS">Berjalan</option>
          <option value="RESOLVED">Selesai</option><option value="CLOSED">Ditutup</option>
          <option value="REJECTED">Ditolak</option><option value="DUPLICATE">Duplikat</option>
        </select>
        <select className="h-10 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 text-sm" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">Semua Kategori</option>
          <option value="SECURITY">Keamanan</option><option value="WASTE">Sampah</option>
          <option value="STREET_LIGHT">Lampu Jalan</option><option value="DRAINAGE">Drainase</option>
          <option value="ROAD">Jalan</option><option value="COMMON_FACILITY">Fasilitas</option>
          <option value="NOISE">Kebisingan</option><option value="ANIMAL">Hewan</option>
          <option value="OTHER">Lainnya</option>
        </select>
      </div>

      {loading ? <div className="py-12 text-center text-zinc-500">Memuat...</div> : reports.length === 0 ? (
        <div className="py-12 text-center text-zinc-500">Tidak ada laporan.</div>
      ) : (
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
                <th className="text-left px-4 py-3 font-medium text-zinc-500">Judul</th>
                <th className="text-left px-4 py-3 font-medium text-zinc-500">Kategori</th>
                <th className="text-left px-4 py-3 font-medium text-zinc-500">Prioritas</th>
                <th className="text-left px-4 py-3 font-medium text-zinc-500">Status</th>
                <th className="text-left px-4 py-3 font-medium text-zinc-500">Pelapor</th>
                <th className="text-left px-4 py-3 font-medium text-zinc-500">Staff</th>
                <th className="text-right px-4 py-3 font-medium text-zinc-500">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => (
                <tr key={r.id} className="border-b border-zinc-100 dark:border-zinc-800/50">
                  <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-50">{r.title}</td>
                  <td className="px-4 py-3 text-zinc-500 text-xs">{r.category.replace("_", " ")}</td>
                  <td className="px-4 py-3 text-zinc-500 text-xs">{r.priority}</td>
                  <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded ${statusColor(r.status)}`}>{r.status.replace("_", " ")}</span></td>
                  <td className="px-4 py-3 text-xs text-zinc-500">{r.reporter?.name ?? "—"}</td>
                  <td className="px-4 py-3 text-xs text-zinc-500">{r.assignedStaff?.name ?? "—"}</td>
                  <td className="px-4 py-3 text-right space-x-2">
                    {r.status === "NEW" && <button onClick={() => action(r.id, "verify")} className="text-xs text-green-600 hover:underline">Verifikasi</button>}
                    {r.status === "VERIFIED" && <button onClick={() => { const sid = prompt("Staff ID?"); if (sid) action(r.id, "assign", { staffId: sid }); }} className="text-xs text-purple-600 hover:underline">Tugaskan</button>}
                    {r.status === "RESOLVED" && <button onClick={() => action(r.id, "close")} className="text-xs text-zinc-500 hover:underline">Tutup</button>}
                    <Link href={`/admin/reports/${r.id}`} className="text-xs text-zinc-600 hover:underline">Detail</Link>
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
