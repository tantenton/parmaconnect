"use client";

import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface Resident {
  id: string;
  fullName: string;
  familyRelationship: string;
  residentStatus: string;
  phone: string | null;
  email: string | null;
  moveInDate: string | null;
  moveOutDate: string | null;
  isPrimaryContact: boolean;
  createdAt: string;
  household: {
    householdNumber: string;
    unit: {
      unitNumber: string;
      displayName: string | null;
      block: { code: string; name: string };
    } | null;
  };
}

export default function AdminResidentsPage() {
  const [items, setItems] = useState<Resident[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const limit = 20;

  const fetchData = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (search) params.set("search", search);
    const res = await fetch(`/api/admin/residents?${params}`);
    const data = await res.json();
    setItems(data.residents ?? []);
    setTotal(data.total ?? 0);
    setLoading(false);
  }, [page, search]);

  useEffect(() => {
    // Data fetch synchronizes this client component with the API.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, [fetchData]);

  const pages = Math.max(1, Math.ceil(total / limit));

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      ACTIVE: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      INACTIVE: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
      MOVED_OUT: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    };
    const labels: Record<string, string> = {
      ACTIVE: "Aktif",
      INACTIVE: "Nonaktif",
      MOVED_OUT: "Pindah",
    };
    return <span className={`px-2 py-0.5 rounded text-xs font-medium ${colors[status] || "bg-zinc-100 text-zinc-600"}`}>{labels[status] || status}</span>;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Warga</h1>
          <p className="text-sm text-zinc-500 mt-1">{total} warga terdaftar</p>
        </div>
      </div>

      <Input
        placeholder="Cari nama warga..."
        value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        className="mb-4 max-w-sm"
      />

      {loading ? (
        <p className="text-zinc-500 text-sm">Memuat...</p>
      ) : items.length === 0 ? (
        <div className="text-center py-12 text-zinc-400">
          <p className="text-lg">Belum ada warga</p>
          <p className="text-sm mt-1">Warga akan muncul setelah didaftarkan melalui halaman Keluarga</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400">
                  <th className="text-left px-4 py-3 font-medium">Nama</th>
                  <th className="text-left px-4 py-3 font-medium">Hubungan</th>
                  <th className="text-left px-4 py-3 font-medium">Unit / Blok</th>
                  <th className="text-left px-4 py-3 font-medium">KK</th>
                  <th className="text-left px-4 py-3 font-medium">Kontak</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {items.map((r) => (
                  <tr key={r.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                    <td className="px-4 py-3 text-zinc-900 dark:text-zinc-50 font-medium">{r.fullName}</td>
                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                      {r.isPrimaryContact ? <span className="font-medium">{r.familyRelationship}*</span> : r.familyRelationship}
                    </td>
                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                      {r.household.unit
                        ? `${r.household.unit.block.code}${r.household.unit.unitNumber} ${r.household.unit.displayName ? `(${r.household.unit.displayName})` : ""}`
                        : "-"}
                   </td>
                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{r.household.householdNumber}</td>
                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                      {r.phone ? <div>{r.phone}</div> : null}
                      {r.email ? <div className="text-xs">{r.email}</div> : null}
                    </td>
                    <td className="px-4 py-3">{statusBadge(r.residentStatus)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-4 text-sm text-zinc-500">
            <span>Halaman {page} dari {pages}</span>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="px-3 py-1.5 rounded border border-zinc-200 dark:border-zinc-800 disabled:opacity-40 hover:bg-zinc-50 dark:hover:bg-zinc-900">Sebelumnya</button>
              <button disabled={page >= pages} onClick={() => setPage(page + 1)} className="px-3 py-1.5 rounded border border-zinc-200 dark:border-zinc-800 disabled:opacity-40 hover:bg-zinc-50 dark:hover:bg-zinc-900">Selanjutnya</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}