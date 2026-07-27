"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Report {
  id: string; title: string; category: string; priority: string; status: string;
  location: string | null; isPublic: boolean; createdAt: string;
  reporter: { id: string; name: string | null; role: string } | null;
  assignedStaff: { id: string; name: string | null; role: string } | null;
  _count?: { timeline: number };
}

export default function ResidentReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await fetch("/api/reports");
      const data = await res.json();
      if (cancelled) return;
      setReports(data.reports ?? []);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  const statusColor = (s: string) =>
    s === "NEW" ? "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400" :
    s === "VERIFIED" ? "bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-400" :
    s === "ASSIGNED" ? "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400" :
    s === "IN_PROGRESS" ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400" :
    s === "RESOLVED" ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400" :
    s === "CLOSED" ? "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-500" :
    s === "REJECTED" ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400" :
    "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400";

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Laporan Saya</h1>
        <Link href="/resident/reports/new" className="rounded-lg bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 px-4 py-2 text-sm font-medium">+ Buat Laporan</Link>
      </div>

      {loading ? <div className="py-12 text-center text-zinc-500">Memuat...</div> : reports.length === 0 ? (
        <div className="py-12 text-center text-zinc-500">Belum ada laporan.</div>
      ) : (
        <ul className="space-y-3">
          {reports.map((r) => (
            <li key={r.id}>
              <Link href={`/resident/reports/${r.id}`} className="block rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{r.title}</h3>
                    <p className="text-xs text-zinc-400 mt-1">{r.category.replace("_", " ")} • {new Date(r.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded ${statusColor(r.status)}`}>{r.status.replace("_", " ")}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
