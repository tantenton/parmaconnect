"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Input } from "@/components/ui";
import { Badge } from "@/components/ui";

interface Block {
  id: string;
  code: string;
  name: string;
  description: string | null;
  sortOrder: number;
  status: string;
  _count?: { units: number };
}

export default function BlockListPage() {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const limit = 20;

  const fetchBlocks = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (search) params.set("search", search);
    if (statusFilter) params.set("status", statusFilter);

    const res = await fetch(`/api/admin/blocks?${params}`);
    if (!res.ok) return;
    const data = await res.json();
    setBlocks(data.blocks);
    setTotal(data.total);
    setLoading(false);
  }, [page, search, statusFilter]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchBlocks();
  }, [fetchBlocks]);

  const totalPages = Math.ceil(total / limit);

  const statusColor = (s: string) => {
    switch (s) {
      case "ACTIVE": return "success";
      case "INACTIVE": return "warning";
      case "ARCHIVED": return "secondary";
      default: return "default";
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Blok</h1>
          <p className="text-sm text-zinc-500 mt-1">{total} blok terdaftar</p>
        </div>
        <Link
          href="/admin/blocks/new"
          className="inline-flex items-center h-10 px-4 rounded-lg bg-zinc-900 text-zinc-50 text-sm font-medium hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-colors"
        >
          + Blok Baru
        </Link>
      </div>

      <div className="flex gap-3 mb-4">
        <div className="flex-1">
          <Input
            placeholder="Cari blok..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <select
          className="h-10 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 text-sm"
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
        >
          <option value="">Semua Status</option>
          <option value="ACTIVE">Aktif</option>
          <option value="INACTIVE">Nonaktif</option>
          <option value="ARCHIVED">Diarsipkan</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-12 text-zinc-500">Memuat...</div>
      ) : blocks.length === 0 ? (
        <div className="text-center py-12 text-zinc-500">Belum ada blok</div>
      ) : (
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
                <th className="text-left px-4 py-3 font-medium text-zinc-500 dark:text-zinc-400">Kode</th>
                <th className="text-left px-4 py-3 font-medium text-zinc-500 dark:text-zinc-400">Nama</th>
                <th className="text-left px-4 py-3 font-medium text-zinc-500 dark:text-zinc-400">Urutan</th>
                <th className="text-left px-4 py-3 font-medium text-zinc-500 dark:text-zinc-400">Unit</th>
                <th className="text-left px-4 py-3 font-medium text-zinc-500 dark:text-zinc-400">Status</th>
                <th className="text-right px-4 py-3 font-medium text-zinc-500 dark:text-zinc-400">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {blocks.map((block) => (
                <tr key={block.id} className="border-b border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                  <td className="px-4 py-3 font-mono font-medium text-zinc-900 dark:text-zinc-50">{block.code}</td>
                  <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">{block.name}</td>
                  <td className="px-4 py-3 text-zinc-500">{block.sortOrder}</td>
                  <td className="px-4 py-3 text-zinc-500">{block._count?.units ?? "-"}</td>
                  <td className="px-4 py-3">
                    <Badge variant={statusColor(block.status) as "success" | "warning" | "secondary"}>
                      {block.status === "ACTIVE" ? "Aktif" : block.status === "INACTIVE" ? "Nonaktif" : "Diarsipkan"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/blocks/${block.id}`}
                      className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
                    >
                      Ubah
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
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
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
