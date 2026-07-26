"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui";

export default function NewBlockPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/blocks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, name, description, sortOrder: parseInt(sortOrder) }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Gagal membuat blok");
        return;
      }

      router.push("/admin/blocks");
    } catch {
      setError("Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/blocks" className="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300">
          ← Kembali
        </Link>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mt-2">Blok Baru</h1>
      </div>

      <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
        {error && (
          <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-3 text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Kode Blok *</label>
          <Input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="A" required maxLength={10} />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Nama Blok *</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Blok A" required maxLength={100} />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Deskripsi</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full h-20 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm resize-none"
            maxLength={500}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Urutan</label>
          <Input type="number" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} min="0" />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="h-10 px-6 rounded-lg bg-zinc-900 text-zinc-50 text-sm font-medium hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-colors"
          >
            {loading ? "Menyimpan..." : "Simpan"}
          </button>
          <Link
            href="/admin/blocks"
            className="h-10 px-6 rounded-lg border border-zinc-200 dark:border-zinc-800 flex items-center text-sm text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-colors"
          >
            Batal
          </Link>
        </div>
      </form>
    </div>
  );
}
