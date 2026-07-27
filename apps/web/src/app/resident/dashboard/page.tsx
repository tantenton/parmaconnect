"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface DashboardData {
  community: { id: string; name: string; branding: unknown } | null;
  urgentAnnouncements: UrgentAnnouncement[];
  latestAnnouncements: LatestAnnouncement[];
  household: HouseholdInfo | null;
  documents: { total: number; verified: number; pending: number; rejected: number };
  activeReports: number;
  nextEvent: { id: string; title: string; startsAt: string; location: string | null } | null;
  contacts: { id: string; name: string; phone: string | null; category: string }[];
  quickLinks: { label: string; href: string }[];
}

interface UrgentAnnouncement { id: string; title: string; category: string; priority: string; startsAt: string }
interface LatestAnnouncement extends UrgentAnnouncement { isRead: boolean }
interface HouseholdInfo {
  id: string; householdNumber: string; verificationStatus: string; status: string;
  unit: { unitNumber: string; block: { code: string; name: string } } | null;
  memberCount: number; hasHead: boolean; hasPrimaryContact: boolean;
}

export default function ResidentDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await fetch("/api/resident/dashboard");
      const json = await res.json();
      if (cancelled) return;
      if (!res.ok) { setError(json.error || "Gagal memuat"); setLoading(false); return; }
      setData(json);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  if (loading) return <div className="py-12 text-center text-zinc-500">Memuat dasbor...</div>;
  if (error) return <div className="py-12 text-center text-red-500">{error}</div>;
  if (!data) return null;

  const verifyLabel = (s: string) =>
    s === "VERIFIED" ? "Terverifikasi" : s === "DRAFT" ? "Draft" : s === "SUBMITTED" ? "Dikirim" :
    s === "NEEDS_REVISION" ? "Perlu Revisi" : s === "REJECTED" ? "Ditolak" : s === "UNREGISTERED" ? "Belum Daftar" : s;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{data.community?.name ?? "Komunitas"}</h1>
        <p className="text-sm text-zinc-500 mt-1">Dasbor Warga</p>
      </div>

      {data.urgentAnnouncements.length > 0 && (
        <div className="rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/30 p-4">
          <h2 className="text-sm font-semibold text-red-700 dark:text-red-400 mb-2">⚠ Pengumuman Darurat</h2>
          <div className="space-y-2">
            {data.urgentAnnouncements.map((a) => (
              <Link key={a.id} href={`/resident/announcements/${a.id}`} className="block text-sm text-red-800 dark:text-red-300 hover:underline">
                {a.title}
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {data.quickLinks.map((link) => (
          <Link key={link.href} href={link.href}
            className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
            <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{link.label}</span>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-5">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-3">Keluarga</h2>
          {data.household ? (
            <dl className="space-y-1 text-sm">
              <div className="flex justify-between"><dt className="text-zinc-500">No. Rumah Tangga</dt><dd className="font-mono">{data.household.householdNumber}</dd></div>
              <div className="flex justify-between"><dt className="text-zinc-500">Unit</dt><dd>{data.household.unit ? `${data.household.unit.block.code} / ${data.household.unit.unitNumber}` : "-"}</dd></div>
              <div className="flex justify-between"><dt className="text-zinc-500">Verifikasi</dt><dd>{verifyLabel(data.household.verificationStatus)}</dd></div>
              <div className="flex justify-between"><dt className="text-zinc-500">Anggota</dt><dd>{data.household.memberCount}</dd></div>
            </dl>
          ) : (
            <p className="text-sm text-zinc-500">Belum terdaftar dalam rumah tangga.</p>
          )}
        </div>

        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-5">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-3">Dokumen</h2>
          <dl className="space-y-1 text-sm">
            <div className="flex justify-between"><dt className="text-zinc-500">Total</dt><dd>{data.documents.total}</dd></div>
            <div className="flex justify-between"><dt className="text-zinc-500">Terverifikasi</dt><dd className="text-green-600">{data.documents.verified}</dd></div>
            <div className="flex justify-between"><dt className="text-zinc-500">Menunggu</dt><dd className="text-amber-600">{data.documents.pending}</dd></div>
            <div className="flex justify-between"><dt className="text-zinc-500">Ditolak</dt><dd className="text-red-600">{data.documents.rejected}</dd></div>
          </dl>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Pengumuman Terbaru</h2>
          <Link href="/resident/announcements" className="text-xs text-zinc-500 hover:text-zinc-700">Lihat semua</Link>
        </div>
        {data.latestAnnouncements.length === 0 ? (
          <p className="text-sm text-zinc-500">Belum ada pengumuman.</p>
        ) : (
          <ul className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
            {data.latestAnnouncements.map((a) => (
              <li key={a.id} className="py-2">
                <Link href={`/resident/announcements/${a.id}`} className="flex items-center justify-between text-sm hover:underline">
                  <span className={a.isRead ? "text-zinc-500" : "font-medium text-zinc-900 dark:text-zinc-50"}>{a.title}</span>
                  {!a.isRead && <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-5">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-3">Laporan Aktif</h2>
          <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{data.activeReports}</p>
          <Link href="/resident/reports" className="text-xs text-zinc-500 hover:text-zinc-700 mt-1 inline-block">Lihat laporan</Link>
        </div>

        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-5">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-3">Acara Berikutnya</h2>
          {data.nextEvent ? (
            <div>
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{data.nextEvent.title}</p>
              <p className="text-xs text-zinc-500 mt-1">{new Date(data.nextEvent.startsAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</p>
              {data.nextEvent.location && <p className="text-xs text-zinc-500">{data.nextEvent.location}</p>}
            </div>
          ) : (
            <p className="text-sm text-zinc-500">Tidak ada acara mendatang.</p>
          )}
        </div>
      </div>

      {data.contacts.length > 0 && (
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-5">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-3">Kontak Penting</h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            {data.contacts.map((c) => (
              <li key={c.id} className="flex justify-between">
                <span className="text-zinc-700 dark:text-zinc-300">{c.name}</span>
                {c.phone && <span className="font-mono text-xs text-zinc-500">{c.phone}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
