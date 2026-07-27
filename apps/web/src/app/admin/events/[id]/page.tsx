"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface Event { id: string; title: string; description: string | null; location: string | null; startsAt: string; endsAt: string; capacity: number | null; status: string; isRegistered?: boolean; organizer: { id: string; name: string | null } | null; attendees: { id: string; user: { id: string; name: string | null } }[]; _count?: { attendees: number }; }

export default function AdminEventDetailPage() {
  const params = useParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let c = false;
    (async () => {
      const r = await fetch(`/api/events/${params.id}`); const d = await r.json();
      if (!c) { setEvent(d.event); setLoading(false); }
    })();
    return () => { c = true; };
  }, [params.id]);

  async function act(a: string) {
    await fetch(`/api/events/${params.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: a }) });
    const r = await fetch(`/api/events/${params.id}`); const d = await r.json(); setEvent(d.event);
  }

  if (loading) return <div className="py-12 text-center text-zinc-500">Memuat...</div>;
  if (!event) return null;

  return (
    <div className="max-w-2xl mx-auto">
      <Link href="/admin/events" className="text-sm text-zinc-500 hover:text-zinc-700 mb-4 inline-block">← Kembali</Link>
      <span className="text-xs px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">{event.status}</span>
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mt-2 mb-2">{event.title}</h1>
      <p className="text-xs text-zinc-400 mb-4">{new Date(event.startsAt).toLocaleDateString("id-ID",{day:"numeric",month:"long",year:"numeric"})} • {event.location ?? "—"}</p>
      {event.description && <p className="text-sm text-zinc-700 dark:text-zinc-300 mb-6">{event.description}</p>}
      <div className="flex gap-2 mb-6">
        {event.status === "DRAFT" && <button onClick={() => act("publish")} className="text-xs px-3 py-1.5 rounded-lg bg-green-600 text-white">Publikasi</button>}
        {event.status === "ACTIVE" && <button onClick={() => act("cancel")} className="text-xs px-3 py-1.5 rounded-lg bg-red-600 text-white">Batalkan</button>}
      </div>
      <div><h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-3">Peserta ({event._count?.attendees ?? 0}/{event.capacity ?? "∞"})</h2><ul className="space-y-1">{event.attendees.map((a) => <li key={a.id} className="text-sm text-zinc-600 dark:text-zinc-400">{a.user.name ?? "—"}</li>)}</ul></div>
    </div>
  );
}
