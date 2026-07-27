"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Announcement {
  id: string; title: string; category: string; priority: string;
  status: string; startsAt: string; expiresAt: string | null; audience: string;
  author: { id: string; name: string | null; role: string } | null;
  _count?: { reads: number };
}

export default function AdminAnnouncementListPage() {
  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const params = new URLSearchParams({ admin: "1" });
      if (status) params.set("status", status);
      if (category) params.set("category", category);
      const res = await fetch(`/api/announcements?${params}`);
      const data = await res.json();
      if (cancelled) return;
      setItems(data.announcements ?? []);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [status, category]);

  const statusBadge = (s: string) =>
    s === "PUBLISHED" ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400" :
    s === "DRAFT" ? "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400" :
    s === "SCHEDULED" ? "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400" :
    s === "EXPIRED" ? "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400" :
    s === "ARCHIVED" ? "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-500" :
    "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400";

  async function action(id: string, action: string) {
    const res = await fetch(`/api/announcements/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    if (res.ok) {
      const params = new URLSearchParams({ admin: "1" });
      if (status) params.set("status", status);
      if (category) params.set("category", category);
      const r = await fetch(`/api/announcements?${params}`);
      const d = await r.json();
      setItems(d.announcements ?? []);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Pengumuman</h1>
        <Link href="/admin/announcements/new" className="rounded-lg bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 px-4 py-2 text-sm font-medium">+ Buat</Link>
      </div>

      <div className="flex gap-3 mb-4">
        <select className="h-10 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 text-sm" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Semua Status</option>
          <option value="DRAFT">Draft</option>
          <option value="SCHEDULED">Terjadwal</option>
          <option value="PUBLISHED">Dipublikasi</option>
          <option value="EXPIRED">Kadaluarsa</option>
          <option value="ARCHIVED">Diarsipkan</option>
        </select>
        <select className="h-10 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 text-sm" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">Semua Kategori</option>
          <option value="GENERAL">Umum</option>
          <option value="SECURITY">Keamanan</option>
          <option value="CLEANLINESS">Kebersihan</option>
          <option value="MAINTENANCE">Pemeliharaan</option>
          <option value="EVENT">Acara</option>
          <option value="EMERGENCY">Darurat</option>
        </select>
      </div>

      {loading ? <div className="py-12 text-center text-zinc-500">Memuat...</div> : items.length === 0 ? (
        <div className="py-12 text-center text-zinc-500">Belum ada pengumuman.</div>
      ) : (
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
                <th className="text-left px-4 py-3 font-medium text-zinc-500">Judul</th>
                <th className="text-left px-4 py-3 font-medium text-zinc-500">Kategori</th>
                <th className="text-left px-4 py-3 font-medium text-zinc-500">Prioritas</th>
                <th className="text-left px-4 py-3 font-medium text-zinc-500">Status</th>
                <th className="text-left px-4 py-3 font-medium text-zinc-500">Dibaca</th>
                <th className="text-right px-4 py-3 font-medium text-zinc-500">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {items.map((a) => (
                <tr key={a.id} className="border-b border-zinc-100 dark:border-zinc-800/50">
                  <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-50">{a.title}</td>
                  <td className="px-4 py-3 text-zinc-500">{a.category}</td>
                  <td className="px-4 py-3 text-zinc-500">{a.priority}</td>
                  <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded ${statusBadge(a.status)}`}>{a.status}</span></td>
                  <td className="px-4 py-3 text-zinc-500">{a._count?.reads ?? 0}</td>
                  <td className="px-4 py-3 text-right space-x-2">
                    {a.status === "DRAFT" || a.status === "SCHEDULED" ? (
                      <button onClick={() => action(a.id, "publish")} className="text-xs text-green-600 hover:underline">Publikasi</button>
                    ) : null}
                    {a.status === "PUBLISHED" ? (
                      <>
                        <button onClick={() => action(a.id, "unpublish")} className="text-xs text-amber-600 hover:underline">Batal</button>
                        <button onClick={() => action(a.id, "expire")} className="text-xs text-orange-600 hover:underline">Kadaluarsa</button>
                      </>
                    ) : null}
                    {a.status !== "ARCHIVED" ? (
                      <button onClick={() => action(a.id, "archive")} className="text-xs text-zinc-500 hover:underline">Arsip</button>
                    ) : null}
                    <Link href={`/admin/announcements/${a.id}`} className="text-xs text-zinc-600 hover:underline">Edit</Link>
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
