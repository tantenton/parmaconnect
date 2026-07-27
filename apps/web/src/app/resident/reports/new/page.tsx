"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewReportPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("OTHER");
  const [location, setLocation] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [isPublic, setIsPublic] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    setError("");
    const res = await fetch("/api/reports", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, category, location: location || undefined, priority, isPublic }),
    });
    const data = await res.json();
    if (!res.ok) return setError(data.error || "Gagal");
    router.push("/resident/reports");
  }

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-6">Buat Laporan</h1>
      {error && <p className="text-sm text-red-500 mb-4">{error}</p>}
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Judul</label>
          <input className="mt-1 w-full h-10 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 text-sm" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div>
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Deskripsi</label>
          <textarea className="mt-1 w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm min-h-32" value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Kategori</label>
            <select className="mt-1 w-full h-10 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 text-sm" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="SECURITY">Keamanan</option><option value="WASTE">Sampah</option>
              <option value="STREET_LIGHT">Lampu Jalan</option><option value="DRAINAGE">Drainase</option>
              <option value="ROAD">Jalan</option><option value="COMMON_FACILITY">Fasilitas Umum</option>
              <option value="NOISE">Kebisingan</option><option value="ANIMAL">Hewan</option>
              <option value="OTHER">Lainnya</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Prioritas</label>
            <select className="mt-1 w-full h-10 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 text-sm" value={priority} onChange={(e) => setPriority(e.target.value)}>
              <option value="LOW">Rendah</option><option value="MEDIUM">Sedang</option>
              <option value="HIGH">Tinggi</option><option value="URGENT">Mendesak</option>
            </select>
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Lokasi (opsional)</label>
          <input className="mt-1 w-full h-10 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 text-sm" value={location} onChange={(e) => setLocation(e.target.value)} />
        </div>
        <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
          <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
          Publik (dapat dilihat warga lain)
        </label>
        <button onClick={submit} className="w-full h-10 rounded-lg bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 text-sm font-medium">Kirim Laporan</button>
      </div>
    </div>
  );
}
