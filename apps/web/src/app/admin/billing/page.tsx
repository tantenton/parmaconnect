"use client";

import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface Invoice {
  id: string;
  invoiceNumber: string;
  totalAmount: number;
  currency: string;
  status: string;
  dueDate: string;
  paidAt: string | null;
  createdAt: string;
  billingRule: { name: string; description: string | null } | null;
  items: { id: string; description: string; amount: number; quantity: number }[];
  household: {
    householdNumber: string;
    unit: {
      unitNumber: string;
      displayName: string | null;
      block: { code: string; name: string } | null;
    } | null;
  } | null;
}

export default function AdminBillingPage() {
  const [items, setItems] = useState<Invoice[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const limit = 20;

  const fetchData = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (search) params.set("search", search);
    if (statusFilter) params.set("status", statusFilter);
    const res = await fetch(`/api/admin/billing/invoices?${params}`);
    const data = await res.json();
    setItems(data.invoices ?? []);
    setTotal(data.total ?? 0);
    setLoading(false);
  }, [page, search, statusFilter]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchData(); }, [fetchData]);

  const pages = Math.max(1, Math.ceil(total / limit));

  const statusLabels: Record<string, string> = {
    PENDING: "Belum Bayar",
    PAID: "Lunas",
    OVERDUE: "Terlambat",
    CANCELLED: "Dibatalkan",
  };
  const statusColors: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    PAID: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    OVERDUE: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    CANCELLED: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Tagihan</h1>
          <p className="text-sm text-zinc-500 mt-1">{total} tagihan</p>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 mb-4">
        <Input placeholder="Cari nomor invoice / nama warga..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="h-10 px-3 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm">
          <option value="">Semua Status</option>
          {Object.entries(statusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      {loading ? (
        <p className="text-zinc-500 text-sm">Memuat...</p>
      ) : items.length === 0 ? (
        <div className="text-center py-12 text-zinc-400">
          <p className="text-lg">Belum ada tagihan</p>
          <p className="text-sm mt-1">Tagihan akan muncul setelah aturan iuran dibuat</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400">
                  <th className="text-left px-4 py-3 font-medium">Invoice</th>
                  <th className="text-left px-4 py-3 font-medium">Jenis Iuran</th>
                  <th className="text-left px-4 py-3 font-medium">Unit</th>
                  <th className="text-left px-4 py-3 font-medium">Jumlah</th>
                  <th className="text-left px-4 py-3 font-medium">Jatuh Tempo</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {items.map((inv) => (
                  <tr key={inv.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                    <td className="px-4 py-3 text-zinc-900 dark:text-zinc-50 font-medium">{inv.invoiceNumber}</td>
                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{inv.billingRule?.name || inv.items?.[0]?.description || "Iuran"}</td>
                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                      {inv.household
                        ? `${inv.household.unit?.block?.code ?? ""}${inv.household.unit?.unitNumber ?? ""}`
                        : "-"}
                   </td>
                    <td className="px-4 py-3 text-zinc-900 dark:text-zinc-50">
                      {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(inv.totalAmount)}
                    </td>
                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{new Date(inv.dueDate).toLocaleDateString("id-ID")}</td>
                    <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColors[inv.status] || "bg-zinc-100 text-zinc-600"}`}>{statusLabels[inv.status] || inv.status}</span></td>
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