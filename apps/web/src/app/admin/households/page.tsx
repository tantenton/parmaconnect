"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Input } from "@/components/ui";
import { Badge } from "@/components/ui";

interface Household {
  id: string;
  householdNumber: string;
  occupancyType: string;
  status: string;
  verificationStatus: string;
  startDate: string;
  unit: { unitNumber: string; displayName: string | null; block: { code: string; name: string } };
  residents: { id: string; fullName: string; familyRelationship: string; residentStatus: string; isPrimaryContact: boolean }[];
}

export default function HouseholdListPage() {
  const [items, setItems] = useState<Household[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [verificationStatus, setVerificationStatus] = useState("");
  const [active, setActive] = useState("");
  const [loading, setLoading] = useState(true);
  const limit = 20;

  const fetchData = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (search) params.set("search", search);
    if (verificationStatus) params.set("verificationStatus", verificationStatus);
    if (active) params.set("active", active);
    const res = await fetch(`/api/admin/households?${params}`);
    const data = await res.json();
    setItems(data.households ?? []);
    setTotal(data.total ?? 0);
    setLoading(false);
  }, [page, search, verificationStatus, active]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, [fetchData]);

  const pages = Math.max(1, Math.ceil(total / limit));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Keluarga</h1>
          <p className="text-sm text-zinc-500 mt-1">{total} keluarga</p>
        </div>
        <Link href="/admin/households/new" className="h-10 px-4 rounded-lg bg-zinc-900 text-zinc-50 text-sm font-medium inline-flex items-center dark:bg-zinc-50 dark:text-zinc-900">
          + Keluarga Baru
        </Link>
      </div>

      <div className="grid gap-3 md:grid-cols-3 mb-4">
        <Input placeholder="Cari nomor KK / kontak darurat" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        <select className="h-10 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 text-sm" value={verificationStatus} onChange={(e) => { setVerificationStatus(e.target.value); setPage(1); }}>
          <option value="">Semua Verifikasi</option>
          <option value="UNREGISTERED">Belum Terdaftar</option>
          <option value="DRAFT">Draft</option>
          <option value="SUBMITTED">Dikirim</option>
          <option value="NEEDS_REVISION">Perlu Revisi</option>
          <option value="VERIFIED">Terverifikasi</option>
          <option value="REJECTED">Ditolak</option>
          <option value="INACTIVE">Nonaktif</option>
        </select>
        <select className="h-10 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 text-sm" value={active} onChange={(e) => { setActive(e.target.value); setPage(1); }}>
          <option value="">Semua Status</option>
          <option value="true">Aktif</option>
          <option value="false">Nonaktif</option>
        </select>
      </div>

      {loading ? <div className="py-12 text-center text-zinc-500">Memuat...</div> : items.length === 0 ? <div className="py-12 text-center text-zinc-500">Belum ada keluarga</div> : (
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
                <th className="text-left px-4 py-3">KK</th>
                <th className="text-left px-4 py-3">Unit</th>
                <th className="text-left px-4 py-3">Okupansi</th>
                <th className="text-left px-4 py-3">Anggota</th>
                <th className="text-left px-4 py-3">Verifikasi</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-right px-4 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-zinc-100 dark:border-zinc-800/50">
                  <td className="px-4 py-3 font-medium">{item.householdNumber}</td>
                  <td className="px-4 py-3">{item.unit.unitNumber} • Blok {item.unit.block.code}</td>
                  <td className="px-4 py-3">{item.occupancyType === "OWNER_OCCUPIED" ? "Milik Sendiri" : "Sewa"}</td>
                  <td className="px-4 py-3">{item.residents.length}</td>
                  <td className="px-4 py-3"><Badge>{item.verificationStatus}</Badge></td>
                  <td className="px-4 py-3"><Badge>{item.status}</Badge></td>
                  <td className="px-4 py-3 text-right"><Link href={`/admin/households/${item.id}`} className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50">Detail</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pages > 1 && <div className="flex justify-center gap-2 mt-6">{Array.from({ length: pages }, (_, i) => i + 1).map((p) => <button key={p} onClick={() => setPage(p)} className={`w-8 h-8 rounded text-sm ${p === page ? "bg-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900" : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"}`}>{p}</button>)}</div>}
    </div>
  );
}
