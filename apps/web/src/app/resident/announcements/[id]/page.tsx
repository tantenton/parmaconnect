"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface Announcement {
  id: string; title: string; content: string; category: string; priority: string;
  status: string; startsAt: string; expiresAt: string | null; audience: string;
  author: { id: string; name: string | null; role: string } | null;
}

export default function ResidentAnnouncementDetailPage() {
  const params = useParams<{ id: string }>();
  const [ann, setAnn] = useState<Announcement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await fetch(`/api/announcements/${params.id}`);
      const data = await res.json();
      if (cancelled) return;
      if (!res.ok) { setError(data.error || "Tidak ditemukan"); setLoading(false); return; }
      setAnn(data.announcement ?? data);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [params.id]);

  if (loading) return <div className="py-12 text-center text-zinc-500">Memuat...</div>;
  if (error) return <div className="py-12 text-center text-red-500">{error}</div>;
  if (!ann) return null;

  return (
    <div className="max-w-2xl mx-auto">
      <Link href="/resident/announcements" className="text-sm text-zinc-500 hover:text-zinc-700 mb-4 inline-block">← Kembali</Link>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">{ann.category}</span>
        <span className="text-xs px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">{ann.priority}</span>
      </div>
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">{ann.title}</h1>
      <p className="text-xs text-zinc-400 mb-4">
        {new Date(ann.startsAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
        {ann.author && ` • ${ann.author.name ?? "Admin"}`}
      </p>
      <div className="prose prose-sm dark:prose-invert max-w-none">
        <p className="whitespace-pre-wrap text-zinc-700 dark:text-zinc-300">{ann.content}</p>
      </div>
    </div>
  );
}
