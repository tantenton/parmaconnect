"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface Record { id: string; title: string; content: string; type: string; effectiveDate: string; publishedAt: string | null; publishedBy: { id: string; name: string | null } | null; supersededBy: { id: string; title: string; effectiveDate: string } | null; supersedes: { id: string; title: string; effectiveDate: string }[]; }

export default function ResidentGovernanceDetailPage() {
  const params = useParams<{ id: string }>();
  const [record, setRecord] = useState<Record | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    let c = false;
    (async () => {
      const r = await fetch(`/api/governance/${params.id}`); const d = await r.json();
      if (!c) { if (!r.ok) { setError(d.error || "Tidak ditemukan"); } else { setRecord(d.record); } setLoading(false); }
    })();
    return () => { c = true; };
  }, [params.id]);

  if (loading) return <div className="py-12 text-center text-zinc-500">Memuat...</div>;
  if (error) return <div className="py-12 text-center text-red-500">{error}</div>;
  if (!record) return null;

  return (
    <div className="max-w-2xl mx-auto">
      <Link href="/resident/governance" className="text-sm text-zinc-500 hover:text-zinc-700 mb-4 inline-block">← Kembali</Link>
      <span className="text-xs px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">{record.type}</span>
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mt-2 mb-2">{record.title}</h1>
      <p className="text-xs text-zinc-400 mb-4">Berlaku {new Date(record.effectiveDate).toLocaleDateString("id-ID",{day:"numeric",month:"long",year:"numeric"})}{record.publishedBy ? ` • ${record.publishedBy.name}` : ""}</p>
      <p className="text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap mb-6">{record.content}</p>
      {record.supersededBy && <div className="rounded-xl border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/30 p-4 mb-4"><p className="text-sm text-amber-700 dark:text-amber-400">Record ini telah disupersede oleh: <Link href={`/resident/governance/${record.supersededBy.id}`} className="underline">{record.supersededBy.title}</Link></p></div>}
      {record.supersedes.length > 0 && <div><h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-2">Versi Sebelumnya</h2><ul className="space-y-1">{record.supersedes.map((s) => <li key={s.id}><Link href={`/resident/governance/${s.id}`} className="text-sm text-zinc-500 hover:underline">{s.title} ({new Date(s.effectiveDate).toLocaleDateString("id-ID")})</Link></li>)}</ul></div>}
    </div>
  );
}
