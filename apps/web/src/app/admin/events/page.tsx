"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

interface Event { id: string; title: string; location: string | null; startsAt: string; endsAt: string; capacity: number | null; status: string; _count?: { attendees: number }; organizer: { id: string; name: string | null } | null; }

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let c = false;
    (async () => {
      const r = await fetch("/api/events"); const d = await r.json();
      if (!c) { setEvents(d.events ?? []); setLoading(false); }
    })();
    return () => { c = true; };
  }, []);

  async function act(id: string, a: string) {
    await fetch(`/api/events/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: a }) });
    const r = await fetch("/api/events"); const d = await r.json(); setEvents(d.events ?? []);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Event</h1>
        <Link href="/admin/events/new" className="rounded-lg bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 px-4 py-2 text-sm font-medium">+ Buat</Link>
      </div>
      {loading ? <div className="py-12 text-center text-zinc-500">Memuat...</div> : events.length === 0 ? <div className="py-12 text-center text-zinc-500">Belum ada event.</div> : (
        <ul className="space-y-3">
          {events.map((e) => (
            <li key={e.id} className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{e.title}</h3>
                  <p className="text-xs text-zinc-400 mt-1">{new Date(e.startsAt).toLocaleDateString("id-ID",{day:"numeric",month:"short"})} • {e._count?.attendees ?? 0}/{e.capacity ?? "∞"} peserta</p>
                </div>
                <div className="flex gap-2">
                  <span className="text-xs px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">{e.status}</span>
                  {e.status === "DRAFT" && <button onClick={() => act(e.id,"publish")} className="text-xs text-green-600 hover:underline">Publikasi</button>}
                  {e.status === "ACTIVE" && <button onClick={() => act(e.id,"cancel")} className="text-xs text-red-600 hover:underline">Batalkan</button>}
                  <Link href={`/admin/events/${e.id}`} className="text-xs text-zinc-600 hover:underline">Detail</Link>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
