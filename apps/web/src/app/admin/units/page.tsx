"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Input } from "@/components/ui";
import { Badge } from "@/components/ui";

interface Unit {
  id: string;
  unitNumber: string;
  displayName: string | null;
  occupancyStatus: string;
  ownershipStatus: string;
  notes: string | null;
  block: { id: string; code: string; name: string };
  _count: { households: number };
}

export default function UnitListPage() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [blockFilter, setBlockFilter] = useState("");
  const [occFilter, setOccFilter] = useState("");
  const [blocks, setBlocks] = useState<{ id: string; code: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const limit = 20;

  useEffect(() => {
    fetch("/api/admin/blocks?limit=50")
      .then((r) => r.json())
      .then((d) => setBlocks(d.blocks))
      .catch(() => {});
  }, []);

  const fetchUnits = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (search) params.set("search", search);
    if (blockFilter) params.set("blockId", blockFilter);
    if (occFilter) params.set("occupancyStatus", occFilter);

    const res = await fetch(`/api/admin/units?${params}`);
    if (!res.ok) return;
    const data = await res.json();
    setUnits(data.units);
    setTotal(data.total);
    setLoading(false);
  }, [page, search, blockFilter, occFilter]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchUnits();
  }, [fetchUnits]);

  const totalPages = Math.ceil(total / limit);

  const occColor = (s: string) => {
    switch (s) {
      case "OWNER_OCCUPIED": return "success";
      case "TENANT_OCCUPIED": return "warning";
      case "VACANT": return "default";
      case "RENOVATION": return "destructive";
      case "UNCONFIRMED": return "secondary";
      default: return "default";
    }
  };

  const occLabel = (s: string) => {
    switch (s) {
      case "OWNER_OCCUPIED": return "Dihuni Pemilik";
      case "TENANT_OCCUPIED": return "Dihuni Penyewa";
      case "VACANT": return "Kosong";
      case "RENOVATION": return "Renovasi";
      case "UNCONFIRMED": return "Belum Dikonfirmasi";
      default: return s;
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Unit Rumah</h1>
          <p className="text-sm text-zinc-500 mt-1">{total} unit terdaftar</p>
        </div>
        <Link
          href="/admin/units/new"
          className="inline-flex items-center h-10 px-4 rounded-lg bg-zinc-900 text-zinc-50 text-sm font-medium hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-colors"
        >
          + Unit Baru
        </Link>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="flex-1 min-w-[200px]">
          <Input
            placeholder="Cari nomor unit..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <select
          className="h-10 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 text-sm"
          value={blockFilter}
          onChange={(e) => { setBlockFilter(e.target.value); setPage(1); }}
        >
          <option value="">Semua Blok</option>
          {blocks.map((b) => (
            <option key={b.id} value={b.id}>{b.code} - {b.name}</option>
          ))}
        </select>
        <select
          className="h-10 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 text-sm"
          value={occFilter}
          onChange={(e) => { setOccFilter(e.target.value); setPage(1); }}
        >
          <option value="">Semua Status</option>
          <option value="OWNER_OCCUPIED">Dihuni Pemilik</option>
          <option value="TENANT_OCCUPIED">Dihuni Penyewa</option>
          <option value="VACANT">Kosong</option>
          <option value="RENOVATION">Renovasi</option>
          <option value="UNCONFIRMED">Belum Dikonfirmasi</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-12 text-zinc-500">Memuat...</div>
      ) : units.length === 0 ? (
        <div className="text-center py-12 text-zinc-500">Belum ada unit</div>
      ) : (
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
                <th className="text-left px-4 py-3 font-medium text-zinc-500 dark:text-zinc-400">Unit</th>
                <th className="text-left px-4 py-3 font-medium text-zinc-500 dark:text-zinc-400">Blok</th>
                <th className="text-left px-4 py-3 font-medium text-zinc-500 dark:text-zinc-400">Status Huni</th>
                <th className="text-left px-4 py-3 font-medium text-zinc-500 dark:text-zinc-400">Status Milik</th>
                <th className="text-left px-4 py-3 font-medium text-zinc-500 dark:text-zinc-400">KK</th>
                <th className="text-right px-4 py-3 font-medium text-zinc-500 dark:text-zinc-400">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {units.map((unit) => (
                <tr key={unit.id} className="border-b border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                  <td className="px-4 py-3">
                    <span className="font-medium text-zinc-900 dark:text-zinc-50">{unit.unitNumber}</span>
                    {unit.displayName && (
                      <span className="text-zinc-500 ml-2">({unit.displayName})</span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono text-zinc-600 dark:text-zinc-400">{unit.block.code}</td>
                  <td className="px-4 py-3">
                    <Badge variant={occColor(unit.occupancyStatus) as "success" | "warning" | "default" | "destructive" | "secondary"}>
                      {occLabel(unit.occupancyStatus)}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400 text-xs">{unit.ownershipStatus}</td>
                  <td className="px-4 py-3 text-zinc-500">{unit._count.households}</td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/units/${unit.id}`}
                      className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
                    >
                      Detail
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-8 h-8 rounded text-sm font-medium transition-colors ${
                p === page
                  ? "bg-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900"
                  : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}