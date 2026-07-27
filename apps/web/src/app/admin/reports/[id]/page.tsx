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

export default function AdminReportDetailPage() {
  const params = useParams<{ id: string }>();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState("");
  const [resolution, setResolution] = useState("");
  const [staffId, setStaffId] = useState("");
  const [error, setError] = useState("");

  async function load() {
    const res = await fetch(`/api/reports/${params.id}`);
    const data = await res.json();
    if (!res.ok) { setError(data.error || "Tidak ditemukan"); setLoading(false); return; }
    setReport(data.report);
    setLoading(false);
  }

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

  async function act(action: string, extra?: Record<string, unknown>) {
    const res = await fetch(`/api/reports/${params.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, notes, resolution, staffId, ...extra }),
    });
    if (res.ok) { setNotes(""); setResolution(""); load(); }
  }

  if (loading) return <div className="py-12 text-center text-zinc-500">Memuat...</div>;
  if (error) return <div className="py-12 text-center text-red-500">{error}</div>;
  if (!report) return null;

  const actionLabel = (a: string) =>
    a === "REPORT_CREATED" ? "Laporan dibuat" : a === "VERIFIED" ? "Diverifikasi" :
    a === "REJECTED" ? "Ditolak" : a === "DUPLICATE_MARKED" ? "Duplikat" :
    a === "ASSIGNED" ? "Ditugaskan" : a === "PRIORITY_CHANGED" ? "Prioritas diubah" :
    a === "WORK_STARTED" ? "Pekerjaan dimulai" : a === "PROGRESS_ADDED" ? "Progress" :
    a === "INTERNAL_NOTE" ? "Catatan internal" : a === "RESOLVED" ? "Selesai" :
    a === "CLOSED" ? "Ditutup" : a === "REOPENED" ? "Dibuka kembali" : a === "CANCELLED" ? "Dibatalkan" : a;

  return (
    <div className="max-w-2xl mx-auto">
      <Link href="/admin/reports" className="text-sm text-zinc-500 hover:text-zinc-700 mb-4 inline-block">← Kembali</Link>
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <span className="text-xs px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">{report.category.replace("_", " ")}</span>
        <span className="text-xs px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">{report.priority}</span>
        <span className="text-xs px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">{report.status.replace("_", " ")}</span>
        {report.isPublic && <span className="text-xs px-2 py-0.5 rounded bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400">Publik</span>}
      </div>
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">{report.title}</h1>
      <p className="text-xs text-zinc-400 mb-4">
        {new Date(report.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })} • Pelapor: {report.reporter?.name ?? "—"}
      </p>
      <p className="text-sm text-zinc-700 dark:text-zinc-300 mb-6">{report.description}</p>

      {report.resolution && (
        <div className="rounded-xl border border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950/30 p-4 mb-6">
          <h3 className="text-sm font-semibold text-green-700 dark:text-green-400 mb-1">Resolusi</h3>
          <p className="text-sm text-green-800 dark:text-green-300">{report.resolution}</p>
        </div>
      )}

      {/* Admin actions */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 mb-6 space-y-3">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Aksi Admin</h3>
        <textarea placeholder="Catatan..." className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm min-h-20" value={notes} onChange={(e) => setNotes(e.target.value)} />
        <div className="flex gap-2 flex-wrap">
          {report.status === "NEW" && <button onClick={() => act("verify")} className="text-xs px-3 py-1.5 rounded-lg bg-green-600 text-white">Verifikasi</button>}
          {report.status === "VERIFIED" && (
            <>
              <input placeholder="Staff ID" className="h-8 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-2 text-xs" value={staffId} onChange={(e) => setStaffId(e.target.value)} />
              <button onClick={() => staffId && act("assign")} className="text-xs px-3 py-1.5 rounded-lg bg-purple-600 text-white">Tugaskan</button>
            </>
          )}
          {report.status === "RESOLVED" && <button onClick={() => act("close")} className="text-xs px-3 py-1.5 rounded-lg bg-zinc-600 text-white">Tutup</button>}
          {report.status === "CLOSED" && <button onClick={() => act("reopen")} className="text-xs px-3 py-1.5 rounded-lg bg-amber-600 text-white">Buka Kembali</button>}
          {["NEW", "VERIFIED"].includes(report.status) && <button onClick={() => act("reject")} className="text-xs px-3 py-1.5 rounded-lg bg-red-600 text-white">Tolak</button>}
          {report.status === "IN_PROGRESS" && (
            <>
              <input placeholder="Resolusi..." className="h-8 flex-1 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-2 text-xs" value={resolution} onChange={(e) => setResolution(e.target.value)} />
              <button onClick={() => resolution && act("resolve")} className="text-xs px-3 py-1.5 rounded-lg bg-green-600 text-white">Selesai</button>
            </>
          )}
          <button onClick={() => notes && act("progress", { isInternal: true })} className="text-xs px-3 py-1.5 rounded-lg bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">Catatan Internal</button>
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-3">Riwayat Lengkap</h2>
        <ol className="space-y-3">
          {report.timeline.map((t) => (
            <li key={t.id} className="flex gap-3">
              <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${t.action === "INTERNAL_NOTE" ? "bg-red-400" : "bg-zinc-300 dark:bg-zinc-600"}`} />
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
