"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Input } from "@/components/ui";
import { Badge } from "@/components/ui";

interface Document {
  id: string;
  documentType: string;
  originalFilename: string;
  mimeType: string;
  sizeBytes: number;
  status: string;
  version: number;
  reviewNotes: string | null;
  createdAt: string;
  submittedBy: { id: string; name: string } | null;
  verifier: { id: string; name: string } | null;
}

export default function DocumentListPage() {
  const [docs, setDocs] = useState<Document[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [householdId, setHouseholdId] = useState("");
  const [documentType, setDocumentType] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const limit = 20;

  const fetchDocs = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (householdId) params.set("householdId", householdId);
    if (documentType) params.set("documentType", documentType);
    if (status) params.set("status", status);
    const res = await fetch(`/api/documents?${params}`);
    if (!res.ok) return;
    const data = await res.json();
    setDocs(data.documents ?? []);
    setTotal(data.total ?? 0);
    setLoading(false);
  }, [page, householdId, documentType, status]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchDocs();
  }, [fetchDocs]);

  const pages = Math.max(1, Math.ceil(total / limit));

  const typeColor = (t: string) =>
    t === "FAMILY_CARD" ? "destructive" :
    t === "IDENTITY_CARD" ? "destructive" :
    t === "LEASE_AGREEMENT" ? "default" :
    "secondary" as const;

  const statusLabel = (s: string) =>
    s === "DRAFT" ? "Draft" : s === "SUBMITTED" ? "Dikirim" : s === "UNDER_REVIEW" ? "Diproses" :
    s === "NEEDS_REVISION" ? "Perlu Revisi" : s === "VERIFIED" ? "Terverifikasi" :
    s === "REJECTED" ? "Ditolak" : s === "ARCHIVED" ? "Diarsipkan" : s === "EXPIRED" ? "Kadaluarsa" : s;

  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-6">Dokumen</h1>

      <div className="flex gap-3 mb-4 flex-wrap">
        <Input placeholder="ID Rumah Tangga" value={householdId} onChange={(e) => { setHouseholdId(e.target.value); setPage(1); }} />
        <select className="h-10 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 text-sm" value={documentType} onChange={(e) => { setDocumentType(e.target.value); setPage(1); }}>
          <option value="">Semua Tipe</option>
          <option value="FAMILY_CARD">Kartu Keluarga</option>
          <option value="IDENTITY_CARD">KTP</option>
          <option value="LEASE_AGREEMENT">Perjanjian Sewa</option>
          <option value="RESIDENT_CONSENT">Persetujuan Warga</option>
          <option value="VEHICLE_DOCUMENT">Dokumen Kendaraan</option>
          <option value="OTHER">Lainnya</option>
        </select>
        <select className="h-10 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 text-sm" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
          <option value="">Semua Status</option>
          <option value="DRAFT">Draft</option>
          <option value="SUBMITTED">Dikirim</option>
          <option value="UNDER_REVIEW">Diproses</option>
          <option value="NEEDS_REVISION">Perlu Revisi</option>
          <option value="VERIFIED">Terverifikasi</option>
          <option value="REJECTED">Ditolak</option>
          <option value="ARCHIVED">Diarsipkan</option>
        </select>
      </div>

      {loading ? <div className="py-12 text-center text-zinc-500">Memuat...</div> : docs.length === 0 ? (
        <div className="py-12 text-center text-zinc-500">Belum ada dokumen</div>
      ) : (
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
                <th className="text-left px-4 py-3 font-medium text-zinc-500 dark:text-zinc-400">File</th>
                <th className="text-left px-4 py-3 font-medium text-zinc-500 dark:text-zinc-400">Tipe</th>
                <th className="text-left px-4 py-3 font-medium text-zinc-500 dark:text-zinc-400">Ukuran</th>
                <th className="text-left px-4 py-3 font-medium text-zinc-500 dark:text-zinc-400">Versi</th>
                <th className="text-left px-4 py-3 font-medium text-zinc-500 dark:text-zinc-400">Status</th>
                <th className="text-left px-4 py-3 font-medium text-zinc-500 dark:text-zinc-400">Ditinjau oleh</th>
                <th className="text-right px-4 py-3 font-medium text-zinc-500 dark:text-zinc-400">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {docs.map((doc) => (
                <tr key={doc.id} className="border-b border-zinc-100 dark:border-zinc-800/50">
                  <td className="px-4 py-3 font-mono text-sm text-zinc-600 dark:text-zinc-400">{doc.originalFilename}</td>
                  <td className="px-4 py-3"><Badge variant={typeColor(doc.documentType)}>{doc.documentType.replace("_", " ")}</Badge></td>
                  <td className="px-4 py-3 text-zinc-500 text-xs">{(doc.sizeBytes / 1024).toFixed(0)} KB</td>
                  <td className="px-4 py-3 text-zinc-500">v{doc.version}</td>
                  <td className="px-4 py-3"><Badge variant={doc.status === "VERIFIED" ? "default" : doc.status === "NEEDS_REVISION" ? "destructive" : "secondary"}>{statusLabel(doc.status)}</Badge></td>
                  <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400">{doc.verifier?.name ?? "-"}</td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/documents/${doc.id}`} className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50">Lihat</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <button key={p} onClick={() => setPage(p)} className={`w-8 h-8 rounded text-sm font-medium ${p === page ? "bg-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900" : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"}`}>{p}</button>
          ))}
        </div>
      )}
    </div>
  );
}