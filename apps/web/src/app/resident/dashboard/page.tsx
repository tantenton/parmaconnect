"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Selamat Datang di {data.community?.name ?? "Komunitas"}</h1>
          <p className="text-zinc-500 mt-1">Status Keluarga: <span className="font-semibold text-emerald-600 dark:text-emerald-400">{verifyLabel(data.household?.verificationStatus ?? "")}</span></p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">Warga Aktif</Badge>
          {data.household?.unit && (
             <Badge variant="outline" className="text-zinc-600 border-zinc-200">{data.household.unit.block.code}{data.household.unit.unitNumber}</Badge>
          )}
        </div>
      </div>

      {data.urgentAnnouncements.length > 0 && (
        <div className="rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/30 p-4">
          <h2 className="text-sm font-semibold text-red-700 dark:text-red-400 mb-2 flex items-center gap-2">
            <span className="animate-pulse">●</span> PENGUMUMAN DARURAT
          </h2>
          <div className="space-y-2">
            {data.urgentAnnouncements.map((a) => (
              <Link key={a.id} href={`/resident/announcements/${a.id}`} className="block text-sm font-medium text-red-800 dark:text-red-300 hover:underline">
                • {a.title}
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <section className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <h2 className="font-semibold text-zinc-900 dark:text-zinc-50">Layanan Cepat</h2>
            </div>
            <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
              {data.quickLinks.map((link) => (
                <Link key={link.href} href={link.href}
                  className="flex flex-col items-center justify-center p-3 rounded-lg border border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors text-center gap-2">
                  <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">{link.label}</span>
                </Link>
              ))}
            </div>
          </section>

          <section className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <h2 className="font-semibold text-zinc-900 dark:text-zinc-50">Pengumuman Terbaru</h2>
              <Link href="/resident/announcements" className="text-xs text-emerald-600 hover:underline">Lihat Semua</Link>
            </div>
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {data.latestAnnouncements.length === 0 ? (
                <div className="p-8 text-center text-zinc-500 text-sm italic">Belum ada pengumuman baru</div>
              ) : data.latestAnnouncements.map((a) => (
                <Link key={a.id} href={`/resident/announcements/${a.id}`} className="block p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{a.title}</p>
                      <p className="text-xs text-zinc-500 mt-1 uppercase tracking-wider">{a.category}</p>
                    </div>
                    {!a.isRead && <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1"></span>}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 shadow-sm">
            <h2 className="font-semibold text-zinc-900 dark:text-zinc-50 mb-4">Informasi Keluarga</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-500">No. Keluarga</span>
                <span className="font-mono text-zinc-900 dark:text-zinc-50">{data.household?.householdNumber ?? "-"}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-500">Anggota</span>
                <span className="text-zinc-900 dark:text-zinc-50">{data.household?.memberCount ?? 0} Orang</span>
              </div>
              <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Dokumen Warga</h3>
                <div className="grid grid-cols-2 gap-2">
                   <div className="p-2 rounded bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
                     <p className="text-xs text-zinc-500">Diverifikasi</p>
                     <p className="text-lg font-bold text-emerald-600">{data.documents.verified}</p>
                   </div>
                   <div className="p-2 rounded bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
                     <p className="text-xs text-zinc-500">Pending</p>
                     <p className="text-lg font-bold text-blue-600">{data.documents.pending}</p>
                   </div>
                </div>
              </div>
            </div>
          </section>

          {data.nextEvent && (
            <section className="bg-emerald-600 rounded-xl p-4 text-white shadow-lg">
              <h2 className="text-xs font-bold uppercase tracking-widest opacity-80 mb-2">Acara Terdekat</h2>
              <p className="font-bold text-lg leading-tight">{data.nextEvent.title}</p>
              <div className="mt-4 space-y-2 text-sm opacity-90">
                <p className="flex items-center gap-2">📅 {new Date(data.nextEvent.startsAt).toLocaleDateString("id-ID", { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                <p className="flex items-center gap-2">📍 {data.nextEvent.location ?? "Area Komplek"}</p>
              </div>
              <Link href={`/resident/events/${data.nextEvent.id}`} className="mt-4 block w-full py-2 text-center bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors backdrop-blur-sm">Lihat Detail</Link>
            </section>
          )}

          <section className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 shadow-sm">
            <h2 className="font-semibold text-zinc-900 dark:text-zinc-50 mb-4">Kontak Penting</h2>
            <div className="space-y-3">
              {data.contacts.map(c => (
                <div key={c.id} className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50 truncate">{c.name}</p>
                    <p className="text-[10px] text-zinc-500 uppercase">{c.category}</p>
                  </div>
                  <a href={`tel:${c.phone}`} className="w-8 h-8 flex items-center justify-center rounded-full bg-emerald-100 text-emerald-600 hover:bg-emerald-200 transition-colors text-xs font-bold">✆</a>
                </div>
              ))}
              <Link href="/resident/contacts" className="block text-center text-xs text-emerald-600 pt-2 hover:underline">Lihat Kontak Lainnya</Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}