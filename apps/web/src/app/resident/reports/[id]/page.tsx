"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface Report {
  id: string; title: string; description: string; category: string; priority: string; status: string;
  location: string | null; isPublic: boolean; resolution: string | null;
  createdAt: string; resolvedAt: string | null; closedAt: string | null;
  reporter: { id: string; name: string | null; role: string } | null;
  assignedStaff: { id: string; name: string | null; role: string } | null;
  timeline: TimelineEntry[];
}

interface TimelineEntry {
  id: string; action: string; notes: string | null; createdAt: string;
  performedBy: { id: string; name: string | null; role: string };
}

export default function ResidentReportDetailPage() {
  const params = useParams<{ id: string }>();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await fetch(`/api/reports/${params.id}`);
      const data = await res.json();
      if (cancelled) return;
      if (!res.ok) { setError(data.error || "Tidak ditemukan"); setLoading(false); return; }
      setReport(data.report);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [params.id]);

  if (loading) return <div className="py-12 text-center text-zinc-500">Memuat...</div>;
  if (error) return <div className="py-12 text-center text-red-500">{error}</div>;
  if (!report) return null;

  const actionLabel = (a: string) =>
    a === "REPORT_CREATED" ? "Laporan dibuat" : a === "VERIFIED" ? "Diverifikasi" :
    a === "REJECTED" ? "Ditolak" : a === "DUPLICATE_MARKED" ? "Duplikat" :
    a === "ASSIGNED" ? "Ditugaskan" : a === "PRIORITY_CHANGED" ? "Prioritas diubah" :
    a === "WORK_STARTED" ? "Pekerjaan dimulai" : a === "PROGRESS_ADDED" ? "Progress" :
    a === "RESOLVED" ? "Selesai" : a === "CLOSED" ? "Ditutup" : a === "REOPENED" ? "Dibuka kembali" :
    a === "CANCELLED" ? "Dibatalkan" : a;

  return (
    <div className="max-w-2xl mx-auto">
      <Link href="/resident/reports" className="text-sm text-zinc-500 hover:text-zinc-700 mb-4 inline-block">← Kembali</Link>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">{report.category.replace("_", " ")}</span>
        <span className="text-xs px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">{report.priority}</span>
        <span className="text-xs px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">{report.status.replace("_", " ")}</span>
      </div>
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">{report.title}</h1>
      <p className="text-xs text-zinc-400 mb-4">{new Date(report.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</p>
      <p className="text-sm text-zinc-700 dark:text-zinc-300 mb-6">{report.description}</p>

      {report.resolution && (
        <div className="rounded-xl border border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950/30 p-4 mb-6">
          <h3 className="text-sm font-semibold text-green-700 dark:text-green-400 mb-1">Resolusi</h3>
          <p className="text-sm text-green-800 dark:text-green-300">{report.resolution}</p>
        </div>
      )}

      <div>
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-3">Riwayat</h2>
        <ol className="space-y-3">
          {report.timeline.map((t) => (
            <li key={t.id} className="flex gap-3">
              <div className="w-2 h-2 rounded-full bg-zinc-300 dark:bg-zinc-600 mt-1.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{actionLabel(t.action)}</p>
                {t.notes && <p className="text-xs text-zinc-500 mt-0.5">{t.notes}</p>}
                <p className="text-xs text-zinc-400">{new Date(t.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })} • {t.performedBy.name ?? "—"}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
