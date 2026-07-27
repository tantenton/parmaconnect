"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Visitor {
  id: string;
  name: string;
  licensePlate: string | null;
  visitCode: string;
  status: string;
  validFrom: string;
  validUntil: string;
  checkInAt: string | null;
  checkOutAt: string | null;
}

export default function ResidentVisitorsPage() {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [householdId, setHouseholdId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      // Get household ID from session via a lightweight endpoint
      const sessionRes = await fetch("/api/auth/me");
      if (!sessionRes.ok) return;
      const sessionData = await sessionRes.json();
      const hhId = sessionData.user?.householdId;
      if (!hhId) { setLoading(false); return; }
      setHouseholdId(hhId);
      const res = await fetch(`/api/visitors?householdId=${hhId}`);
      const data = await res.json();
      if (cancelled) return;
      setVisitors(data.visitors ?? []);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  async function cancelVisitor(id: string) {
    const res = await fetch(`/api/visitors/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "cancel" }),
    });
    if (res.ok && householdId) {
      const r = await fetch(`/api/visitors?householdId=${householdId}`);
      const d = await r.json();
      setVisitors(d.visitors ?? []);
    }
  }

  const statusColor = (s: string) =>
    s === "PENDING" ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400" :
    s === "APPROVED" ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400" :
    s === "ACTIVE" ? "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400" :
    s === "COMPLETED" ? "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-500" :
    s === "EXPIRED" ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400" :
    "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400";

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Pengunjung Saya</h1>
        <Link href="/resident/visitors/new" className="rounded-lg bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 px-4 py-2 text-sm font-medium">
          + Daftarkan Pengunjung
        </Link>
      </div>

      {loading ? (
        <div className="py-12 text-center text-zinc-500">Memuat...</div>
      ) : visitors.length === 0 ? (
        <div className="py-12 text-center text-zinc-500">Belum ada pengunjung.</div>
      ) : (
        <ul className="space-y-3">
          {visitors.map((v) => (
            <li key={v.id} className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{v.name}</h3>
                  <p className="text-xs text-zinc-400 mt-1">
                    Kode: <span className="font-mono">{v.visitCode}</span>
                    {v.licensePlate && ` • Plat: ${v.licensePlate}`}
                  </p>
                  <p className="text-xs text-zinc-400">
                    {new Date(v.validFrom).toLocaleDateString("id-ID")} – {new Date(v.validUntil).toLocaleDateString("id-ID")}
                  </p>
                  {v.checkInAt && <p className="text-xs text-zinc-400 mt-0.5">Check-in: {new Date(v.checkInAt).toLocaleString("id-ID")}</p>}
                  {v.checkOutAt && <p className="text-xs text-zinc-400">Check-out: {new Date(v.checkOutAt).toLocaleString("id-ID")}</p>}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded ${statusColor(v.status)}`}>{v.status.replace("_", " ")}</span>
                  {["PENDING", "APPROVED"].includes(v.status) && (
                    <button
                      onClick={() => cancelVisitor(v.id)}
                      className="text-xs text-red-600 hover:underline"
                    >
                      Batalkan
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}