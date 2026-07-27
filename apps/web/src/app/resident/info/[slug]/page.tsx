"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface InfoPage { id: string; title: string; content: string; category: string | null; publishedAt: string | null; publishedBy: { id: string; name: string | null } | null; }

export default function ResidentInfoDetailPage() {
  const params = useParams<{ slug: string }>();
  const [page, setPage] = useState<InfoPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    let c = false;
    (async () => {
      const r = await fetch(`/api/info/${params.slug}`); const d = await r.json();
      if (!c) { if (!r.ok) { setError(d.error || "Tidak ditemukan"); } else { setPage(d.page); } setLoading(false); }
    })();
    return () => { c = true; };
  }, [params.slug]);

  if (loading) return <div className="py-12 text-center text-zinc-500">Memuat...</div>;
  if (error) return <div className="py-12 text-center text-red-500">{error}</div>;
  if (!page) return null;

  return (
    <div className="max-w-2xl mx-auto">
      <Link href="/resident/info" className="text-sm text-zinc-500 hover:text-zinc-700 mb-4 inline-block">← Kembali</Link>
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">{page.title}</h1>
      {page.publishedAt && <p className="text-xs text-zinc-400 mb-4">Dipublikasi {new Date(page.publishedAt).toLocaleDateString("id-ID",{day:"numeric",month:"long",year:"numeric"})} • {page.publishedBy?.name ?? "—"}</p>}
      <div className="prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: page.content }} />
    </div>
  );
}
