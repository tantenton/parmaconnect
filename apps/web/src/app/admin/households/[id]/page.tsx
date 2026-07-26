"use client";

import { useState, useEffect, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui";
import { Badge } from "@/components/ui";

interface Resident {
  id: string;
  fullName: string;
  familyRelationship: string;
  residentStatus: string;
  phone: string | null;
  email: string | null;
  isPrimaryContact: boolean;
  moveInDate: string;
  moveOutDate: string | null;
}

interface Household {
  id: string;
  householdNumber: string;
  occupancyType: string;
  status: string;
  verificationStatus: string;
  startDate: string;
  endDate: string | null;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  headResidentId: string | null;
  primaryContactResidentId: string | null;
  unit: { id: string; unitNumber: string; block: { code: string; name: string } };
  residents: Resident[];
}

const RELATIONSHIPS = ["KEPALA_KELUARGA", "SPOUSE", "CHILD", "PARENT", "SIBLING", "OTHER"];

export default function HouseholdDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [hh, setHh] = useState<Household | null>(null);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);
  // Add resident form
  const [showAdd, setShowAdd] = useState(false);
  const [rName, setRName] = useState("");
  const [rRel, setRRel] = useState("OTHER");
  const [rPhone, setRPhone] = useState("");
  const [rEmail, setREmail] = useState("");

  const fetchData = useCallback(async () => {
    const res = await fetch(`/api/admin/households/${id}`);
    if (!res.ok) { router.push("/admin/households"); return; }
    const data = await res.json();
    setHh(data.household);
    setLoading(false);
  }, [id, router]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, [fetchData]);

  async function patch(body: Record<string, unknown>) {
    setError(""); setMsg("");
    const res = await fetch(`/api/admin/households/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error || "Gagal"); return false; }
    setHh(data.household);
    setMsg("Tersimpan");
    return true;
  }

  async function transition(to: string) {
    await patch({ verificationStatus: to });
  }

  async function deactivate() {
    if (!confirm(`Nonaktifkan keluarga ${hh?.householdNumber}? Riwayat tetap tersimpan.`)) return;
    const res = await fetch(`/api/admin/households/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) { setError(data.error || "Gagal"); return; }
    setHh(data.household);
    setMsg("Keluarga dinonaktifkan");
  }

  async function addResident(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch(`/api/admin/households/${id}/residents`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName: rName, familyRelationship: rRel, phone: rPhone || undefined, email: rEmail || undefined }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error || "Gagal menambah warga"); return; }
    setShowAdd(false); setRName(""); setRPhone(""); setREmail("");
    fetchData();
  }

  async function moveOut(residentId: string, name: string) {
    if (!confirm(`Catat ${name} pindah keluar?`)) return;
    await fetch(`/api/admin/households/${id}/residents/${residentId}`, { method: "DELETE" });
    fetchData();
  }

  if (loading) return <div className="py-12 text-center text-zinc-500">Memuat...</div>;
  if (!hh) return null;

  const vsColor = (s: string) => s === "VERIFIED" ? "default" : s === "SUBMITTED" ? "secondary" : s === "NEEDS_REVISION" ? "destructive" : "outline";

  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/households" className="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300">← Kembali</Link>
        <div className="flex items-center gap-3 mt-2 flex-wrap">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{hh.householdNumber}</h1>
          <Badge variant={vsColor(hh.verificationStatus)}>{hh.verificationStatus}</Badge>
          <Badge variant={hh.status === "ACTIVE" ? "default" : "secondary"}>{hh.status}</Badge>
        </div>
        <p className="text-sm text-zinc-500 mt-1">Unit {hh.unit.unitNumber} • Blok {hh.unit.block.code} — {hh.unit.block.name}</p>
      </div>

      {error && <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-3 text-sm text-red-600 dark:text-red-400 mb-4 max-w-2xl">{error}</div>}
      {msg && <div className="rounded-lg bg-green-50 dark:bg-green-900/20 p-3 text-sm text-green-600 dark:text-green-400 mb-4 max-w-2xl">{msg}</div>}

      <div className="grid gap-6 lg:grid-cols-2 max-w-5xl">
        {/* Info */}
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 space-y-3">
          <h2 className="font-semibold text-zinc-900 dark:text-zinc-50">Informasi Keluarga</h2>
          <div className="text-sm space-y-2">
            <div className="flex justify-between"><span className="text-zinc-500">Okupansi</span><span>{hh.occupancyType === "OWNER_OCCUPIED" ? "Milik Sendiri" : "Sewa"}</span></div>
            <div className="flex justify-between"><span className="text-zinc-500">Tanggal Masuk</span><span>{new Date(hh.startDate).toLocaleDateString("id-ID")}</span></div>
            {hh.endDate && <div className="flex justify-between"><span className="text-zinc-500">Tanggal Keluar</span><span>{new Date(hh.endDate).toLocaleDateString("id-ID")}</span></div>}
            <div className="flex justify-between"><span className="text-zinc-500">Kontak Darurat</span><span>{hh.emergencyContactName ?? "-"} {hh.emergencyContactPhone ? `(${hh.emergencyContactPhone})` : ""}</span></div>
          </div>
          {/* Verification actions */}
          <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
            <p className="text-xs font-medium text-zinc-500">TINDAKAN VERIFIKASI</p>
            <div className="flex flex-wrap gap-2">
              {hh.verificationStatus === "UNREGISTERED" && (
                <button onClick={() => transition("DRAFT")} className="h-8 px-3 rounded border border-zinc-300 dark:border-zinc-700 text-xs">Mulai Draft</button>
              )}
              {hh.verificationStatus === "SUBMITTED" && (
                <>
                  <button onClick={() => transition("VERIFIED")} className="h-8 px-3 rounded bg-green-600 text-white text-xs">Verifikasi</button>
                  <button onClick={() => transition("NEEDS_REVISION")} className="h-8 px-3 rounded bg-yellow-600 text-white text-xs">Minta Revisi</button>
                  <button onClick={() => transition("REJECTED")} className="h-8 px-3 rounded bg-red-600 text-white text-xs">Tolak</button>
                </>
              )}
              {hh.verificationStatus === "DRAFT" && (
                <>
                  <button onClick={() => transition("SUBMITTED")} className="h-8 px-3 rounded bg-blue-600 text-white text-xs">Kirim Verifikasi</button>
                  <button onClick={() => transition("REJECTED")} className="h-8 px-3 rounded bg-red-600 text-white text-xs">Tolak</button>
                </>
              )}
              {hh.verificationStatus === "NEEDS_REVISION" && (
                <button onClick={() => transition("SUBMITTED")} className="h-8 px-3 rounded bg-blue-600 text-white text-xs">Kirim Ulang</button>
              )}
              {hh.verificationStatus === "REJECTED" && (
                <button onClick={() => transition("DRAFT")} className="h-8 px-3 rounded border border-zinc-300 dark:border-zinc-700 text-xs">Buka Draft Lagi</button>
              )}
              {hh.status === "ACTIVE" && hh.verificationStatus !== "INACTIVE" && (
                <button onClick={deactivate} className="h-8 px-3 rounded border border-red-300 text-red-600 text-xs">Nonaktifkan</button>
              )}
            </div>
          </div>
        </div>

        {/* Members */}
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-zinc-900 dark:text-zinc-50">Anggota ({hh.residents.length})</h2>
            {hh.status === "ACTIVE" && (
              <button onClick={() => setShowAdd(!showAdd)} className="h-8 px-3 rounded bg-zinc-900 text-zinc-50 text-xs dark:bg-zinc-50 dark:text-zinc-900">+ Tambah</button>
            )}
          </div>

          {showAdd && (
            <form onSubmit={addResident} className="mb-4 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900 space-y-2">
              <Input placeholder="Nama lengkap *" value={rName} onChange={(e) => setRName(e.target.value)} required />
              <select className="w-full h-10 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 text-sm" value={rRel} onChange={(e) => setRRel(e.target.value)}>
                {RELATIONSHIPS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
              <Input placeholder="Telepon" value={rPhone} onChange={(e) => setRPhone(e.target.value)} />
              <Input placeholder="Email" type="email" value={rEmail} onChange={(e) => setREmail(e.target.value)} />
              <button className="h-9 px-4 rounded-lg bg-zinc-900 text-zinc-50 text-sm dark:bg-zinc-50 dark:text-zinc-900">Simpan Anggota</button>
            </form>
          )}

          {hh.residents.length === 0 ? (
            <p className="text-sm text-zinc-500">Belum ada anggota.</p>
          ) : (
            <ul className="space-y-2">
              {hh.residents.map((r) => (
                <li key={r.id} className="flex items-start justify-between gap-2 p-2 rounded-lg border border-zinc-100 dark:border-zinc-800">
                  <div className="text-sm">
                    <p className="font-medium text-zinc-900 dark:text-zinc-50">
                      {r.fullName}
                      {hh.headResidentId === r.id && <Badge variant="default" className="ml-2">Kepala</Badge>}
                      {r.isPrimaryContact && <Badge variant="secondary" className="ml-1">Kontak Utama</Badge>}
                    </p>
                    <p className="text-zinc-500 text-xs">{r.familyRelationship} • {r.residentStatus}</p>
                    {r.phone && <p className="text-zinc-500 text-xs">{r.phone}</p>}
                  </div>
                  <div className="flex flex-col gap-1">
                    {hh.headResidentId !== r.id && r.residentStatus === "ACTIVE" && (
                      <button onClick={() => patch({ headResidentId: r.id })} className="text-xs text-zinc-600 hover:text-zinc-900 dark:text-zinc-400">Jadikan Kepala</button>
                    )}
                    {!r.isPrimaryContact && r.residentStatus === "ACTIVE" && (
                      <button onClick={() => patch({ primaryContactResidentId: r.id })} className="text-xs text-zinc-600 hover:text-zinc-900 dark:text-zinc-400">Jadikan Kontak</button>
                    )}
                    {r.residentStatus === "ACTIVE" && (
                      <button onClick={() => moveOut(r.id, r.fullName)} className="text-xs text-red-600">Pindah Keluar</button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
