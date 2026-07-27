"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

interface Record { id: string; title: string; type: string; effectiveDate: string; }

export default function ResidentGovernancePage() {
  const [records, setRecords] = useState<Record[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let c = false;
    (async () => { const r = await fetch("/api/governance"); const d = await r.json(); if (!c) { setRecords(d.records ?? []); setLoading(false); } })();
    return () => { c = true; };
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-6">Arsip Tata Kelola</h1>
      {loading ? <div className="py-12 text-center text-zinc-500">Memuat...</div> : records.length === 0 ? <div className="py-12 text-center text-zinc-500">Belum ada record.</div> : (
        <ul className="space-y-2">
          {records.map((r) => <li key={r.id}><Link href={`/resident/governance/${r.id}`} className="block rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 hover:border-zinc-300 dark:hover:border-zinc-700"><h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{r.title}</h3><p className="text-xs text-zinc-400">{r.type} • {new Date(r.effectiveDate).toLocaleDateString("id-ID")}</p></Link></li>)}
        </ul>
      )}
    </div>
  );
}
