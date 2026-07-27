"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewEventPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [capacity, setCapacity] = useState("");
  const [error, setError] = useState("");

  async function submit() {
    setError("");
    const res = await fetch("/api/events", { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description: description || undefined, location: location || undefined, startsAt: new Date(startsAt).toISOString(), endsAt: new Date(endsAt).toISOString(), capacity: capacity ? parseInt(capacity) : undefined }) });
    const data = await res.json();
    if (!res.ok) return setError(data.error || "Gagal");
    router.push("/admin/events");
  }

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-6">Buat Event</h1>
      {error && <p className="text-sm text-red-500 mb-4">{error}</p>}
      <div className="space-y-4">
        <div><label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Judul</label><input className="mt-1 w-full h-10 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 text-sm" value={title} onChange={(e) => setTitle(e.target.value)} /></div>
        <div><label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Deskripsi</label><textarea className="mt-1 w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm min-h-24" value={description} onChange={(e) => setDescription(e.target.value)} /></div>
        <div><label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Lokasi</label><input className="mt-1 w-full h-10 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 text-sm" value={location} onChange={(e) => setLocation(e.target.value)} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Mulai</label><input type="datetime-local" className="mt-1 w-full h-10 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 text-sm" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} /></div>
          <div><label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Selesai</label><input type="datetime-local" className="mt-1 w-full h-10 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 text-sm" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} /></div>
        </div>
        <div><label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Kapasitas (opsional)</label><input type="number" className="mt-1 w-full h-10 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 text-sm" value={capacity} onChange={(e) => setCapacity(e.target.value)} /></div>
        <button onClick={submit} className="w-full h-10 rounded-lg bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 text-sm font-medium">Buat Event</button>
      </div>
    </div>
  );
}
