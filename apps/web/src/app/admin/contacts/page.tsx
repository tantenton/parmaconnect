"use client";
import { useState, useEffect } from "react";

interface Contact { id: string; category: string; name: string; phone: string | null; whatsapp: string | null; availability: string | null; visibility: string; sortOrder: number; }

export default function AdminContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState(""); const [category, setCategory] = useState("SECURITY");
  const [phone, setPhone] = useState(""); const [whatsapp, setWhatsapp] = useState("");
  const [availability, setAvailability] = useState(""); const [visibility, setVisibility] = useState("PUBLIC");

  useEffect(() => {
    let c = false;
    (async () => { const r = await fetch("/api/contacts"); const d = await r.json(); if (!c) { setContacts(d.contacts ?? []); setLoading(false); } })();
    return () => { c = true; };
  }, []);

  async function create() {
    await fetch("/api/admin/contacts", { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, category, phone: phone || undefined, whatsapp: whatsapp || undefined, availability: availability || undefined, visibility }) });
    setName(""); setPhone(""); setWhatsapp(""); setAvailability(""); setShowForm(false);
    const r = await fetch("/api/contacts"); const d = await r.json(); setContacts(d.contacts ?? []);
  }

  async function del(id: string) {
    await fetch(`/api/admin/contacts/${id}`, { method: "DELETE" });
    const r = await fetch("/api/contacts"); const d = await r.json(); setContacts(d.contacts ?? []);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Kontak Penting</h1>
        <button onClick={() => setShowForm(!showForm)} className="rounded-lg bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 px-4 py-2 text-sm font-medium">+ Tambah</button>
      </div>
      {showForm && (
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 mb-4 space-y-3">
          <input placeholder="Nama" className="w-full h-10 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 text-sm" value={name} onChange={(e) => setName(e.target.value)} />
          <div className="grid grid-cols-2 gap-3">
            <select className="h-10 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 text-sm" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="SECURITY">Keamanan</option><option value="MANAGEMENT">Manajemen</option><option value="CLEANING">Kebersihan</option>
              <option value="TECHNICIAN">Teknisi</option><option value="AMBULANCE">Ambulans</option><option value="POLICE">Polisi</option>
              <option value="FIRE_DEPARTMENT">Pemadam</option><option value="OTHER">Lainnya</option>
            </select>
            <select className="h-10 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 text-sm" value={visibility} onChange={(e) => setVisibility(e.target.value)}>
              <option value="PUBLIC">Publik</option><option value="RESIDENTS_ONLY">Warga</option>
              <option value="STAFF_ONLY">Staff</option><option value="ADMIN_ONLY">Admin</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="Telepon" className="h-10 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 text-sm" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <input placeholder="WhatsApp" className="h-10 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 text-sm" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
          </div>
          <input placeholder="Ketersediaan (cth: 24 jam)" className="w-full h-10 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 text-sm" value={availability} onChange={(e) => setAvailability(e.target.value)} />
          <button onClick={create} className="w-full h-10 rounded-lg bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 text-sm font-medium">Simpan</button>
        </div>
      )}
      {loading ? <div className="py-12 text-center text-zinc-500">Memuat...</div> : contacts.length === 0 ? <div className="py-12 text-center text-zinc-500">Belum ada kontak.</div> : (
        <ul className="space-y-2">
          {contacts.map((c) => (
            <li key={c.id} className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 flex items-center justify-between">
              <div><h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{c.name}</h3><p className="text-xs text-zinc-400">{c.category.replace("_"," ")} • {c.phone ?? "—"} • {c.visibility}</p></div>
              <button onClick={() => del(c.id)} className="text-xs text-red-600 hover:underline">Hapus</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
