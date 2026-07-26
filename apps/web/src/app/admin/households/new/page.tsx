"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui";

export default function NewHouseholdPage() {
  const router = useRouter();
  const [units, setUnits] = useState<{ id: string; unitNumber: string; block: { code: string } }[]>([]);
  const [unitId, setUnitId] = useState("");
  const [occupancyType, setOccupancyType] = useState("OWNER_OCCUPIED");
  const [moveInDate, setMoveInDate] = useState(new Date().toISOString().slice(0, 10));
  const [emergencyContactName, setEmergencyContactName] = useState("");
  const [emergencyContactPhone, setEmergencyContactPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/admin/units?limit=100")
      .then((r) => r.json())
      .then((d) => {
        setUnits(d.units ?? []);
        if ((d.units ?? []).length > 0) setUnitId(d.units[0].id);
      })
      .catch(() => {});
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/admin/households", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ unitId, occupancyType, moveInDate, emergencyContactName, emergencyContactPhone }) });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return setError(data.error || "Gagal membuat keluarga");
    router.push(`/admin/households/${data.household.id}`);
  }

  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/households" className="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300">← Kembali</Link>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mt-2">Keluarga Baru</h1>
      </div>
      <form onSubmit={submit} className="max-w-lg space-y-4">
        {error && <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-3 text-sm text-red-600 dark:text-red-400">{error}</div>}
        <div className="space-y-2">
          <label className="text-sm font-medium">Unit *</label>
          <select className="w-full h-10 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 text-sm" value={unitId} onChange={(e) => setUnitId(e.target.value)} required>
            {units.map((u) => <option key={u.id} value={u.id}>{u.unitNumber} • Blok {u.block.code}</option>)}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Jenis Okupansi</label>
          <select className="w-full h-10 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 text-sm" value={occupancyType} onChange={(e) => setOccupancyType(e.target.value)}>
            <option value="OWNER_OCCUPIED">Milik Sendiri</option>
            <option value="TENANT_OCCUPIED">Sewa</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Tanggal Masuk</label>
          <Input type="date" value={moveInDate} onChange={(e) => setMoveInDate(e.target.value)} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Kontak Darurat</label>
          <Input value={emergencyContactName} onChange={(e) => setEmergencyContactName(e.target.value)} maxLength={100} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Telepon Kontak Darurat</label>
          <Input value={emergencyContactPhone} onChange={(e) => setEmergencyContactPhone(e.target.value)} maxLength={30} />
        </div>
        <button disabled={loading} className="h-10 px-6 rounded-lg bg-zinc-900 text-zinc-50 text-sm font-medium disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900">{loading ? "Menyimpan..." : "Simpan"}</button>
      </form>
    </div>
  );
}
