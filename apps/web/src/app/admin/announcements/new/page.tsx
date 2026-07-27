"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewAnnouncementPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("GENERAL");
  const [priority, setPriority] = useState("NORMAL");
  const [audience, setAudience] = useState("ALL");
  const [startsAt, setStartsAt] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [schedule, setSchedule] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    setError("");
    const res = await fetch("/api/announcements", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content, category, priority, audience, startsAt: startsAt || undefined, expiresAt: expiresAt || undefined, schedule }),
    });
    const data = await res.json();
    if (!res.ok) return setError(data.error || "Gagal");
    router.push("/admin/announcements");
  }

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-6">Pengumuman Baru</h1>
      {error && <p className="text-sm text-red-500 mb-4">{error}</p>}
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Judul</label>
          <input className="mt-1 w-full h-10 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 text-sm" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div>
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Isi</label>
          <textarea className="mt-1 w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm min-h-32" value={content} onChange={(e) => setContent(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Kategori</label>
            <select className="mt-1 w-full h-10 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 text-sm" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="GENERAL">Umum</option><option value="SECURITY">Keamanan</option>
              <option value="CLEANLINESS">Kebersihan</option><option value="MAINTENANCE">Pemeliharaan</option>
              <option value="EVENT">Acara</option><option value="EMERGENCY">Darurat</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Prioritas</label>
            <select className="mt-1 w-full h-10 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 text-sm" value={priority} onChange={(e) => setPriority(e.target.value)}>
              <option value="LOW">Rendah</option><option value="NORMAL">Normal</option>
              <option value="HIGH">Tinggi</option><option value="URGENT">Mendesak</option>
            </select>
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Audiens</label>
          <select className="mt-1 w-full h-10 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 text-sm" value={audience} onChange={(e) => setAudience(e.target.value)}>
            <option value="ALL">Semua</option><option value="RESIDENTS">Warga</option>
            <option value="STAFF">Staf</option><option value="SECURITY">Keamanan</option>
            <option value="FINANCE">Keuangan</option><option value="ADMINS">Admin</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Mulai</label>
            <input type="datetime-local" className="mt-1 w-full h-10 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 text-sm" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Kadaluarsa</label>
            <input type="datetime-local" className="mt-1 w-full h-10 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 text-sm" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
          <input type="checkbox" checked={schedule} onChange={(e) => setSchedule(e.target.checked)} />
          Jadwalkan (bukan publish langsung)
        </label>
        <button onClick={submit} className="w-full h-10 rounded-lg bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 text-sm font-medium">Simpan</button>
      </div>
    </div>
  );
}
