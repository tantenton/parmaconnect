"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface Event { id: string; title: string; description: string | null; location: string | null; startsAt: string; endsAt: string; capacity: number | null; status: string; isRegistered?: boolean; _count?: { attendees: number }; }

export default function ResidentEventDetailPage() {
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

  async function register() {
    await fetch(`/api/events/${params.id}/attend`, { method: "POST" });
    const r = await fetch(`/api/events/${params.id}`); const d = await r.json(); setEvent(d.event);
  }
  async function cancel() {
    await fetch(`/api/events/${params.id}/attend`, { method: "DELETE" });
    const r = await fetch(`/api/events/${params.id}`); const d = await r.json(); setEvent(d.event);
  }

  if (loading) return <div className="py-12 text-center text-zinc-500">Memuat...</div>;
  if (!event) return null;

  return (
    <div className="max-w-2xl mx-auto">
      <Link href="/resident/events" className="text-sm text-zinc-500 hover:text-zinc-700 mb-4 inline-block">← Kembali</Link>
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">{event.title}</h1>
      <p className="text-xs text-zinc-400 mb-4">{new Date(event.startsAt).toLocaleDateString("id-ID",{day:"numeric",month:"long",year:"numeric"})} • {event.location ?? "—"} • {event._count?.attendees ?? 0}/{event.capacity ?? "∞"} peserta</p>
      {event.description && <p className="text-sm text-zinc-700 dark:text-zinc-300 mb-6">{event.description}</p>}
      {event.status === "ACTIVE" && (
        event.isRegistered
          ? <button onClick={cancel} className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm">Batalkan Kehadiran</button>
          : <button onClick={register} className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm">Daftar Hadir</button>
      )}
    </div>
  );
}
