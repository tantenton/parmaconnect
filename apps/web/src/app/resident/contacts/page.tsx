"use client";
import { useState, useEffect } from "react";

interface Contact { id: string; category: string; name: string; phone: string | null; whatsapp: string | null; availability: string | null; }

export default function ResidentContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let c = false;
    (async () => { const r = await fetch("/api/contacts"); const d = await r.json(); if (!c) { setContacts(d.contacts ?? []); setLoading(false); } })();
    return () => { c = true; };
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-6">Kontak Penting</h1>
      {loading ? <div className="py-12 text-center text-zinc-500">Memuat...</div> : contacts.length === 0 ? <div className="py-12 text-center text-zinc-500">Tidak ada kontak.</div> : (
        <ul className="space-y-3">
          {contacts.map((c) => (
            <li key={c.id} className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
              <div className="flex items-center justify-between">
                <div><h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{c.name}</h3><p className="text-xs text-zinc-400">{c.category.replace("_"," ")}{c.availability ? ` • ${c.availability}` : ""}</p></div>
                <div className="flex gap-2">
                  {c.phone && <a href={`tel:${c.phone}`} className="text-xs px-3 py-1.5 rounded-lg bg-green-600 text-white">Telepon</a>}
                  {c.whatsapp && <a href={`https://wa.me/${c.whatsapp}`} target="_blank" rel="noopener" className="text-xs px-3 py-1.5 rounded-lg bg-green-500 text-white">WhatsApp</a>}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
