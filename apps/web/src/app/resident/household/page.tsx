"use client";

import { useState, useEffect } from "react";
import { Input, Badge } from "@/components/ui";

interface Member { id: string; fullName: string; familyRelationship: string; residentStatus: string; phone: string | null; email: string | null; isPrimaryContact: boolean }
interface Household { id: string; householdNumber: string; occupancyType: string; verificationStatus: string; status: string; emergencyContactName: string | null; emergencyContactPhone: string | null; unit: { unitNumber: string; block: { code: string; name: string } }; residents: Member[] }

export default function OwnHouseholdPage() {
  const [hh, setHh] = useState<Household | null>(null);
  const [currentId, setCurrentId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [rel, setRel] = useState("OTHER");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  async function load() {
    const res = await fetch("/api/resident/household");
    const data = await res.json();
    if (!res.ok) setError(data.error || "Gagal memuat");
    else { setHh(data.household); setCurrentId(data.currentResidentId); }
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  async function submitVerification() {
    setError(""); setMsg("");
    const res = await fetch("/api/resident/household", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: hh?.verificationStatus === "NEEDS_REVISION" ? "resubmit" : "submit" }) });
    const data = await res.json();
    if (!res.ok) return setError(data.error || "Gagal mengirim");
    setHh((prev) => prev ? { ...prev, verificationStatus: data.household.verificationStatus } : prev);
    setMsg("Data keluarga berhasil dikirim untuk verifikasi.");
  }

  async function addMember(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/resident/household", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ fullName: name, familyRelationship: rel, phone: phone || undefined, email: email || undefined }) });
    const data = await res.json();
    if (!res.ok) return setError(data.error || "Gagal menambah anggota");
    setShowAdd(false); setName(""); setPhone(""); setEmail(""); await load();
  }

  if (loading) return <div className="min-h-screen grid place-items-center text-zinc-500">Memuat...</div>;
  if (!hh) return <div className="min-h-screen grid place-items-center p-4"><div className="max-w-md text-center"><h1 className="text-xl font-bold">Profil Keluarga</h1><p className="text-zinc-500 mt-2">{error || "Profil keluarga belum tersedia."}</p></div></div>;

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-4 sm:p-6">
      <div className="max-w-3xl mx-auto">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Keluarga Saya</h1>
          <p className="text-sm text-zinc-500">{hh.householdNumber} • Unit {hh.unit.unitNumber}, Blok {hh.unit.block.code}</p>
        </header>
        {error && <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm">{error}</div>}
        {msg && <div className="mb-4 p-3 rounded-lg bg-green-50 text-green-600 text-sm">{msg}</div>}
        <section className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4 mb-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div><p className="text-sm text-zinc-500">Status Verifikasi</p><Badge className="mt-1">{hh.verificationStatus}</Badge></div>
            {["DRAFT", "NEEDS_REVISION"].includes(hh.verificationStatus) && <button onClick={submitVerification} className="h-10 px-4 rounded-lg bg-blue-600 text-white text-sm font-medium">{hh.verificationStatus === "NEEDS_REVISION" ? "Kirim Ulang" : "Kirim untuk Verifikasi"}</button>}
          </div>
          {hh.verificationStatus === "NEEDS_REVISION" && <p className="mt-3 text-sm text-yellow-700 dark:text-yellow-400">Data perlu diperbaiki sebelum dikirim ulang.</p>}
        </section>
        <section className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4">
          <div className="flex items-center justify-between mb-4"><h2 className="font-semibold">Anggota Keluarga ({hh.residents.length})</h2><button onClick={() => setShowAdd(!showAdd)} className="h-9 px-3 rounded-lg bg-zinc-900 text-zinc-50 text-sm dark:bg-zinc-50 dark:text-zinc-900">+ Tambah Anggota</button></div>
          {showAdd && <form onSubmit={addMember} className="mb-4 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900 space-y-2"><Input placeholder="Nama lengkap *" required value={name} onChange={(e) => setName(e.target.value)} /><select value={rel} onChange={(e) => setRel(e.target.value)} className="w-full h-10 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 text-sm"><option value="SPOUSE">Pasangan</option><option value="CHILD">Anak</option><option value="PARENT">Orang Tua</option><option value="SIBLING">Saudara</option><option value="OTHER">Lainnya</option></select><Input placeholder="Telepon" value={phone} onChange={(e) => setPhone(e.target.value)} /><Input placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} /><button className="h-9 px-4 rounded-lg bg-zinc-900 text-white text-sm">Simpan</button></form>}
          <div className="space-y-2">{hh.residents.map((m) => <div key={m.id} className="p-3 rounded-lg border border-zinc-100 dark:border-zinc-800"><div className="flex justify-between gap-2"><div><p className="font-medium text-sm">{m.fullName} {m.id === currentId && <span className="text-zinc-500">(Anda)</span>}</p><p className="text-xs text-zinc-500">{m.familyRelationship} • {m.residentStatus}</p></div>{m.isPrimaryContact && <Badge>Kontak Utama</Badge>}</div></div>)}</div>
        </section>
      </div>
    </main>
  );
}
