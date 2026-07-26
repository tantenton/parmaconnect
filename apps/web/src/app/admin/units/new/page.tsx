"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui";

export default function NewUnitPage() {
  const router = useRouter();
  const [blocks, setBlocks] = useState<{ id: string; code: string; name: string }[]>([]);
  const [blockId, setBlockId] = useState("");
  const [unitNumber, setUnitNumber] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [occupancyStatus, setOccupancyStatus] = useState("UNCONFIRMED");
  const [ownershipStatus, setOwnershipStatus] = useState("UNCONFIRMED");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/admin/blocks?limit=50&status=ACTIVE")
      .then((r) => r.json())
      .then((d) => {
        setBlocks(d.blocks);
        if (d.blocks.length > 0) setBlockId(d.blocks[0].id);
      })
      .catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/units", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blockId, unitNumber, displayName, occupancyStatus, ownershipStatus, notes }),
      });

      const data = await res.json();
      if (!res.ok) { setError(data.error || "Gagal membuat unit"); return; }
      router.push("/admin/units");
    } catch {
      setError("Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/units" className="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300">
          ← Kembali
        </Link>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mt-2">Unit Baru</h1>
      </div>

      <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
        {error && (
          <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-3 text-sm text-red-600 dark:text-red-400">{error}</div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Blok *</label>
          <select
            value={blockId}
            onChange={(e) => setBlockId(e.target.value)}
            required
            className="w-full h-10 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 text-sm"
          >
            <option value="">Pilih Blok</option>
            {blocks.map((b) => (
              <option key={b.id} value={b.id}>{b.code} - {b.name}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Nomor Unit *</label>
          <Input value={unitNumber} onChange={(e) => setUnitNumber(e.target.value.toUpperCase())} placeholder="A01" required maxLength={20} />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Nama Tampilan</label>
          <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Unit A01" maxLength={100} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Status Huni</label>
            <select
              value={occupancyStatus}
              onChange={(e) => setOccupancyStatus(e.target.value)}
              className="w-full h-10 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 text-sm"
            >
              <option value="UNCONFIRMED">Belum Dikonfirmasi</option>
              <option value="OWNER_OCCUPIED">Dihuni Pemilik</option>
              <option value="TENANT_OCCUPIED">Dihuni Penyewa</option>
              <option value="VACANT">Kosong</option>
              <option value="RENOVATION">Renovasi</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Status Milik</label>
            <select
              value={ownershipStatus}
              onChange={(e) => setOwnershipStatus(e.target.value)}
              className="w-full h-10 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 text-sm"
            >
              <option value="UNCONFIRMED">Belum Dikonfirmasi</option>
              <option value="OWNER_OCCUPIED">Milik Pemilik</option>
              <option value="TENANT_OCCUPIED">Milik Penyewa</option>
              <option value="VACANT">Kosong</option>
              <option value="RENOVATION">Renovasi</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Catatan</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full h-20 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm resize-none"
            maxLength={1000}
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading}
            className="h-10 px-6 rounded-lg bg-zinc-900 text-zinc-50 text-sm font-medium hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-colors"
          >
            {loading ? "Menyimpan..." : "Simpan"}
          </button>
          <Link
            href="/admin/units"
            className="h-10 px-6 rounded-lg border border-zinc-200 dark:border-zinc-800 flex items-center text-sm text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-colors"
          >
            Batal
          </Link>
        </div>
      </form>
    </div>
  );
}