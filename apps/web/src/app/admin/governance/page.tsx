"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

interface Record { id: string; title: string; type: string; effectiveDate: string; approvalStatus: string; visibility: string; publishedAt: string | null; supersededBy: { id: string; title: string } | null; }

export default function AdminGovernancePage() {
  const [records, setRecords] = useState<Record[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState(""); const [content, setContent] = useState("");
  const [type, setType] = useState("MINUTES"); const [effectiveDate, setEffectiveDate] = useState("");
  const [visibility, setVisibility] = useState("RESIDENTS_ONLY");

  useEffect(() => {
    let c = false;
    (async () => { const r = await fetch("/api/admin/governance"); const d = await r.json(); if (!c) { setRecords(d.records ?? []); setLoading(false); } })();
    return () => { c = true; };
  }, []);

  async function create() {
    await fetch("/api/admin/governance", { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content, type, effectiveDate: new Date(effectiveDate).toISOString(), visibility }) });
    setTitle(""); setContent(""); setEffectiveDate(""); setShowForm(false);
    const r = await fetch("/api/admin/governance"); const d = await r.json(); setRecords(d.records ?? []);
  }

  async function publish(id: string) {
    await fetch(`/api/admin/governance/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "publish" }) });
    const r = await fetch("/api/admin/governance"); const d = await r.json(); setRecords(d.records ?? []);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Tata Kelola</h1>
        <button onClick={() => setShowForm(!showForm)} className="rounded-lg bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 px-4 py-2 text-sm font-medium">+ Tambah</button>
      </div>
      {showForm && (
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 mb-4 space-y-3">
          <input placeholder="Judul" className="w-full h-10 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 text-sm" value={title} onChange={(e) => setTitle(e.target.value)} />
          <textarea placeholder="Konten" className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm min-h-32" value={content} onChange={(e) => setContent(e.target.value)} />
          <div className="grid grid-cols-2 gap-3">
            <select className="h-10 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 text-sm" value={type} onChange={(e) => setType(e.target.value)}>
              <option value="MINUTES">Notula Rapat</option><option value="DECISION">Keputusan</option><option value="POLICY">Kebijakan</option>
            </select>
            <input type="date" className="h-10 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 text-sm" value={effectiveDate} onChange={(e) => setEffectiveDate(e.target.value)} />
          </div>
          <select className="w-full h-10 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 text-sm" value={visibility} onChange={(e) => setVisibility(e.target.value)}>
            <option value="RESIDENTS_ONLY">Warga</option><option value="STAFF_ONLY">Staff</option><option value="ADMIN_ONLY">Admin</option>
          </select>
          <button onClick={create} className="w-full h-10 rounded-lg bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 text-sm font-medium">Simpan</button>
        </div>
      )}
      {loading ? <div className="py-12 text-center text-zinc-500">Memuat...</div> : records.length === 0 ? <div className="py-12 text-center text-zinc-500">Belum ada record.</div> : (
        <ul className="space-y-2">
          {records.map((r) => (
            <li key={r.id} className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 flex items-center justify-between">
              <div><h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{r.title}</h3><p className="text-xs text-zinc-400">{r.type} • {new Date(r.effectiveDate).toLocaleDateString("id-ID")} • {r.approvalStatus}{r.supersededBy ? ` • Superseded by: ${r.supersededBy.title}` : ""}</p></div>
              {r.approvalStatus === "DRAFT" && <button onClick={() => publish(r.id)} className="text-xs text-green-600 hover:underline">Publikasi</button>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
