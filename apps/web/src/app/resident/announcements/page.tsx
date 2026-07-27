"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Announcement {
  id: string; title: string; content: string; category: string; priority: string;
  status: string; startsAt: string; expiresAt: string | null; audience: string;
  author: { id: string; name: string | null; role: string } | null;
  _count?: { reads: number };
  isRead?: boolean;
}

export default function ResidentAnnouncementListPage() {
  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const params = new URLSearchParams();
      if (category) params.set("category", category);
      const res = await fetch(`/api/announcements?${params}`);
      const data = await res.json();
      if (cancelled) return;
      setItems(data.announcements ?? []);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [category]);

  const priorityBadge = (p: string) =>
    p === "URGENT" ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400" :
    p === "HIGH" ? "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400" :
    "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400";

  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-6">Pengumuman</h1>

      <div className="flex gap-3 mb-4">
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
        <ul className="space-y-3">
          {items.map((a) => (
            <li key={a.id}>
              <Link href={`/resident/announcements/${a.id}`} className="block rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {!a.isRead && <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />}
                      <span className={`text-xs px-1.5 py-0.5 rounded ${priorityBadge(a.priority)}`}>{a.priority}</span>
                      <span className="text-xs text-zinc-400">{a.category}</span>
                    </div>
                    <h3 className={`text-sm ${a.isRead ? "text-zinc-500" : "font-medium text-zinc-900 dark:text-zinc-50"}`}>{a.title}</h3>
                    <p className="text-xs text-zinc-400 mt-1">{new Date(a.startsAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</p>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
