"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

interface InfoPage { id: string; title: string; slug: string; category: string | null; }

export default function ResidentInfoPage() {
  const [pages, setPages] = useState<InfoPage[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let c = false;
    (async () => { const r = await fetch("/api/info"); const d = await r.json(); if (!c) { setPages(d.pages ?? []); setLoading(false); } })();
    return () => { c = true; };
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-6">Informasi</h1>
      {loading ? <div className="py-12 text-center text-zinc-500">Memuat...</div> : pages.length === 0 ? <div className="py-12 text-center text-zinc-500">Belum ada informasi.</div> : (
        <ul className="space-y-2">
          {pages.map((p) => <li key={p.id}><Link href={`/resident/info/${p.slug}`} className="block rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 hover:border-zinc-300 dark:hover:border-zinc-700"><h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{p.title}</h3><p className="text-xs text-zinc-400">{p.category ?? "—"}</p></Link></li>)}
        </ul>
      )}
    </div>
  );
}
