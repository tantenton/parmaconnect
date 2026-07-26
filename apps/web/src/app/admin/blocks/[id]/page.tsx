"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui";
import { Badge } from "@/components/ui";

export default function EditBlockPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [id, setId] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [status, setStatus] = useState("ACTIVE");
  const [unitCount, setUnitCount] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    params.then((p) => setId(p.id));
  }, [params]);

  const fetchBlock = useCallback(async () => {
    if (!id) return;
    const res = await fetch(`/api/admin/blocks/${id}`);
    if (!res.ok) { router.push("/admin/blocks"); return; }
    const data = await res.json();
    const block = data.block;
    setCode(block.code);
    setName(block.name);
    setDescription(block.description ?? "");
    setSortOrder(String(block.sortOrder));
    setStatus(block.status);
    setUnitCount(block._count?.units ?? 0);
    setFetching(false);
  }, [id, router]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchBlock();
  }, [fetchBlock]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const body: Record<string, unknown> = { name, description, sortOrder: parseInt(sortOrder) };
      const res = await fetch(`/api/admin/blocks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) { setError(data.error || "Gagal menyimpan"); return; }
      router.push("/admin/blocks");
    } catch {
      setError("Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  async function handleArchive() {
    if (!confirm(`Arsipkan blok ${code}? Tindakan ini tidak dapat dibatalkan dengan mudah.`)) return;
    setLoading(true);
    setError("");

    const res = await fetch(`/api/admin/blocks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "ARCHIVED" }),
    });

    const data = await res.json();
    if (!res.ok) { setError(data.error || "Gagal mengarsipkan"); setLoading(false); return; }
    router.push("/admin/blocks");
  }

  if (fetching) return <div className="text-center py-12 text-zinc-500">Memuat...</div>;

  const statusColor = status === "ACTIVE" ? "success" as const : status === "INACTIVE" ? "warning" as const : "secondary" as const;
  const statusLabel = status === "ACTIVE" ? "Aktif" : status === "INACTIVE" ? "Nonaktif" : "Diarsipkan";

  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/blocks" className="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300">
          ← Kembali
        </Link>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mt-2">Blok {code}</h1>
        <Badge variant={statusColor} className="mt-2">{statusLabel}</Badge>
        <p className="text-sm text-zinc-500 mt-1">{unitCount} unit</p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
        {error && (
          <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-3 text-sm text-red-600 dark:text-red-400">{error}</div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Kode Blok</label>
          <Input value={code} disabled className="bg-zinc-50 dark:bg-zinc-900" />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Nama Blok *</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} required maxLength={100} />
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

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading || status === "ARCHIVED"}
            className="h-10 px-6 rounded-lg bg-zinc-900 text-zinc-50 text-sm font-medium hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-colors"
          >
            {loading ? "Menyimpan..." : "Simpan"}
          </button>
          {status !== "ARCHIVED" && (
            <button type="button" onClick={handleArchive}
              className="h-10 px-6 rounded-lg border border-red-200 text-red-600 text-sm hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors"
            >
              Arsipkan
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
