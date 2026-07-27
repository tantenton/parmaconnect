"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

interface InfoPage { id: string; title: string; slug: string; category: string | null; status: string; updatedAt: string; }

export default function AdminInfoPage() {
  const [pages, setPages] = useState<InfoPage[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let c = false;
    (async () => { const r = await fetch("/api/admin/info"); const d = await r.json(); if (!c) { setPages(d.pages ?? []); setLoading(false); } })();
    return () => { c = true; };
  }, []);

  async function act(id: string, a: string) {
    await fetch(`/api/admin/info/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: a }) });
    const r = await fetch("/api/admin/info"); const d = await r.json(); setPages(d.pages ?? []);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Halaman Informasi</h1>
        <Link href="/admin/info/new" className="rounded-lg bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 px-4 py-2 text-sm font-medium">+ Buat</Link>
      </div>
      {loading ? <div className="py-12 text-center text-zinc-500">Memuat...</div> : pages.length === 0 ? <div className="py-12 text-center text-zinc-500">Belum ada halaman.</div> : (
        <ul className="space-y-2">
          {pages.map((p) => (
            <li key={p.id} className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 flex items-center justify-between">
              <div><h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{p.title}</h3><p className="text-xs text-zinc-400">{p.category ?? "—"} • {p.status}</p></div>
              <div className="flex gap-2">
                {p.status === "DRAFT" && <button onClick={() => act(p.id,"publish")} className="text-xs text-green-600 hover:underline">Publikasi</button>}
                {p.status === "PUBLISHED" && <button onClick={() => act(p.id,"archive")} className="text-xs text-zinc-500 hover:underline">Arsipkan</button>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
