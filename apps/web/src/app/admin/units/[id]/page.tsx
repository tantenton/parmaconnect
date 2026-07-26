"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui";
import { Badge } from "@/components/ui";

interface UnitDetail {
  id: string;
  unitNumber: string;
  displayName: string | null;
  occupancyStatus: string;
  ownershipStatus: string;
  notes: string | null;
  block: { id: string; code: string; name: string };
  households: Array<{
    id: string;
    householdNumber: string;
    status: string;
    verificationStatus: string;
    residents: Array<{ id: string; fullName: string; isPrimaryContact: boolean }>;
  }>;
  _count: { households: number };
}

export default function EditUnitPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [id, setId] = useState<string | null>(null);
  const [blocks, setBlocks] = useState<{ id: string; code: string; name: string }[]>([]);
  const [unit, setUnit] = useState<UnitDetail | null>(null);
  const [blockId, setBlockId] = useState("");
  const [unitNumber, setUnitNumber] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [occupancyStatus, setOccupancyStatus] = useState("");
  const [ownershipStatus, setOwnershipStatus] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    params.then((p) => setId(p.id));
    fetch("/api/admin/blocks?limit=50")
      .then((r) => r.json())
      .then((d) => setBlocks(d.blocks))
      .catch(() => {});
  }, [params]);

  const fetchUnit = useCallback(async () => {
    if (!id) return;
    const res = await fetch(`/api/admin/units/${id}`);
    if (!res.ok) { router.push("/admin/units"); return; }
    const data = await res.json();
    const u = data.unit;
    setUnit(u);
    setBlockId(u.block.id);
    setUnitNumber(u.unitNumber);
    setDisplayName(u.displayName ?? "");
    setOccupancyStatus(u.occupancyStatus);
    setOwnershipStatus(u.ownershipStatus);
    setNotes(u.notes ?? "");
    setFetching(false);
  }, [id, router]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchUnit();
  }, [fetchUnit]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`/api/admin/units/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blockId, unitNumber, displayName, occupancyStatus, ownershipStatus, notes }),
      });

      const data = await res.json();
      if (!res.ok) { setError(data.error || "Gagal menyimpan"); return; }
      router.push("/admin/units");
    } catch {
      setError("Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  if (fetching) return <div className="text-center py-12 text-zinc-500">Memuat...</div>;
  if (!unit) return null;

  const occColor = (s: string) => {
    switch (s) {
      case "OWNER_OCCUPIED": return "success" as const;
      case "TENANT_OCCUPIED": return "warning" as const;
      case "VACANT": return "default" as const;
      case "RENOVATION": return "destructive" as const;
      case "UNCONFIRMED": return "secondary" as const;
      default: return "default" as const;
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
      <div className="mb-6">
        <Link href="/admin/units" className="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300">
          ← Kembali
        </Link>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mt-2">
          Unit {unit.unitNumber}
        </h1>
        <div className="flex gap-2 mt-2">
          <Badge variant={occColor(unit.occupancyStatus)}>{occLabel(unit.occupancyStatus)}</Badge>
          <span className="text-sm text-zinc-500">Blok {unit.block.code} - {unit.block.name}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-lg space-y-4 mb-8">
        {error && (
          <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-3 text-sm text-red-600 dark:text-red-400">{error}</div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Blok</label>
          <select
            value={blockId}
            onChange={(e) => setBlockId(e.target.value)}
            className="w-full h-10 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 text-sm"
          >
            {blocks.map((b) => (
              <option key={b.id} value={b.id}>{b.code} - {b.name}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Nomor Unit</label>
          <Input value={unitNumber} onChange={(e) => setUnitNumber(e.target.value.toUpperCase())} required maxLength={20} />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Nama Tampilan</label>
          <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} maxLength={100} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Status Huni</label>
            <select value={occupancyStatus} onChange={(e) => setOccupancyStatus(e.target.value)}
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
            <select value={ownershipStatus} onChange={(e) => setOwnershipStatus(e.target.value)}
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
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
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
        </div>
      </form>

      {/* Households at this unit */}
      {unit.households.length > 0 && (
        <div className="max-w-lg">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-3">Keluarga</h2>
          <div className="space-y-2">
            {unit.households.map((hh) => (
              <div key={hh.id} className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-4">
                <p className="font-medium text-zinc-900 dark:text-zinc-50">{hh.householdNumber}</p>
                <p className="text-sm text-zinc-500">
                  Status: {hh.status === "ACTIVE" ? "Aktif" : hh.status}
                  {hh.verificationStatus === "VERIFIED" ? " (Terverifikasi)" : ""}
                </p>
                {hh.residents.length > 0 && (
                  <ul className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 space-y-1">
                    {hh.residents.map((r) => (
                      <li key={r.id}>
                        {r.fullName} {r.isPrimaryContact ? "(Kontak Utama)" : ""}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}