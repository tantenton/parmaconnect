"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

interface Event { id: string; title: string; location: string | null; startsAt: string; _count?: { attendees: number }; capacity: number | null; }

export default function ResidentEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let c = false;
    (async () => {
      const r = await fetch("/api/events?upcoming=1&status=ACTIVE"); const d = await r.json();
      if (!c) { setEvents(d.events ?? []); setLoading(false); }
    })();
    return () => { c = true; };
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-6">Event Mendatang</h1>
      {loading ? <div className="py-12 text-center text-zinc-500">Memuat...</div> : events.length === 0 ? <div className="py-12 text-center text-zinc-500">Tidak ada event mendatang.</div> : (
        <ul className="space-y-3">
          {events.map((e) => (
            <li key={e.id}><Link href={`/resident/events/${e.id}`} className="block rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 hover:border-zinc-300 dark:hover:border-zinc-700">
              <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{e.title}</h3>
              <p className="text-xs text-zinc-400 mt-1">{new Date(e.startsAt).toLocaleDateString("id-ID",{day:"numeric",month:"short"})} • {e.location ?? "—"} • {e._count?.attendees ?? 0}/{e.capacity ?? "∞"}</p>
            </Link></li>
          ))}
        </ul>
      )}
    </div>
  );
}
