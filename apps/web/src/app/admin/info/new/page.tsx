"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewInfoPage() {
  const router = useRouter();
  const [title, setTitle] = useState(""); const [content, setContent] = useState("");
  const [category, setCategory] = useState(""); const [visibility, setVisibility] = useState("PUBLIC");
  const [error, setError] = useState("");

  async function submit() {
    setError("");
    const res = await fetch("/api/admin/info", { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content, category: category || undefined, visibility }) });
    const data = await res.json();
    if (!res.ok) return setError(data.error || "Gagal");
    router.push("/admin/info");
  }

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-6">Halaman Informasi Baru</h1>
      {error && <p className="text-sm text-red-500 mb-4">{error}</p>}
      <div className="space-y-4">
        <div><label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Judul</label><input className="mt-1 w-full h-10 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 text-sm" value={title} onChange={(e) => setTitle(e.target.value)} /></div>
        <div><label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Kategori</label><input className="mt-1 w-full h-10 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 text-sm" value={category} onChange={(e) => setCategory(e.target.value)} /></div>
        <div><label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Konten</label><textarea className="mt-1 w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm min-h-48" value={content} onChange={(e) => setContent(e.target.value)} /></div>
        <select className="w-full h-10 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 text-sm" value={visibility} onChange={(e) => setVisibility(e.target.value)}>
          <option value="PUBLIC">Publik</option><option value="RESIDENTS_ONLY">Warga</option><option value="STAFF_ONLY">Staff</option><option value="ADMIN_ONLY">Admin</option>
        </select>
        <button onClick={submit} className="w-full h-10 rounded-lg bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 text-sm font-medium">Simpan</button>
      </div>
    </div>
  );
}
