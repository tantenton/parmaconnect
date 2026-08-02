"use client";

import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface Document {
  id: string;
  documentType: string;
  fileName: string;
  storageKey: string;
  status: string;
  verifiedAt: string | null;
  versionNumber: number;
  mimeType: string;
  fileSize: number;
  checksum: string | null;
  uploadedAt: string;
  uploadedBy: string;
}

export default function AdminDocumentsPage() {
  const [items, setItems] = useState<Document[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const limit = 20;

  const fetchData = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (search) params.set("search", search);
    if (statusFilter) params.set("status", statusFilter);
    if (typeFilter) params.set("documentType", typeFilter);
    const res = await fetch(`/api/admin/documents?${params}`);
    const data = await res.json();
    setItems(data.documents ?? []);
    setTotal(data.total ?? 0);
    setLoading(false);
  }, [page, search, statusFilter, typeFilter]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchData(); }, [fetchData]);

  const pages = Math.max(1, Math.ceil(total / limit));

  const typeLabels: Record<string, string> = {
    FAMILY_CARD: "Kartu Keluarga",
    IDENTITY_CARD: "KTP",
    LEASE_AGREEMENT: "Perjanjian Sewa",
    RESIDENT_CONSENT: "Persetujuan Warga",
    VEHICLE_DOCUMENT: "Dokumen Kendaraan",
    OTHER: "Lainnya",
  };

  const statusLabels: Record<string, string> = {
    DRAFT: "Draf",
    SUBMITTED: "Dikirim",
    UNDER_REVIEW: "Ditinjau",
    NEEDS_REVISION: "Perlu Revisi",
    VERIFIED: "Terverifikasi",
    REJECTED: "Ditolak",
    ARCHIVED: "Diarsip",
    EXPIRED: "Kadaluarsa",
  };

  const statusColors: Record<string, string> = {
    DRAFT: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300",
    SUBMITTED: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200",
    UNDER_REVIEW: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200",
    NEEDS_REVISION: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-200",
    VERIFIED: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200",
    REJECTED: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200",
    ARCHIVED: "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400",
    EXPIRED: "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-200",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Dokumen Warga</h1>
          <p className="text-sm text-zinc-500 mt-1">{total} dokumen terdaftar</p>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3 mb-4">
        <Input placeholder="Cari file / warga..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="h-10 px-3 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm">
          <option value="">Semua Status</option>
          {Object.entries(statusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }} className="h-10 px-3 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm">
          <option value="">Semua Tipe</option>
          {Object.entries(typeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      {loading ? (
        <p className="text-zinc-500 text-sm">Memuat...</p>
      ) : items.length === 0 ? (
        <div className="text-center py-12 text-zinc-400">
          <p className="text-lg">Belum ada dokumen</p>
          <p className="text-sm mt-1">Dokumen akan muncul setelah warga mengunggah</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400">
                  <th className="text-left px-4 py-3 font-medium">File</th>
                  <th className="text-left px-4 py-3 font-medium">Tipe</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                  <th className="text-left px-4 py-3 font-medium">Versi</th>
                  <th className="text-left px-4 py-3 font-medium">Ukuran</th>
                  <th className="text-left px-4 py-3 font-medium">Diunggah</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {items.map((d) => (
                  <tr key={d.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                    <td className="px-4 py-3 text-zinc-900 dark:text-zinc-50 font-medium">{d.fileName}</td>
                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{typeLabels[d.documentType] || d.documentType}</td>
                    <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColors[d.status] || "bg-zinc-100 text-zinc-600"}`}>{statusLabels[d.status] || d.status}</span></td>
                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">v{d.versionNumber}</td>
                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{(d.fileSize / 1024).toFixed(1)} KB</td>
                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{new Date(d.uploadedAt).toLocaleDateString("id-ID")}</td>
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