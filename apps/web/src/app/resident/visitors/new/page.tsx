"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewVisitorPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    licensePlate: "",
    destinationUnitId: "",
    validFrom: "",
    validUntil: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().slice(0, 16);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const res = await fetch("/api/visitors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        validFrom: new Date(form.validFrom).toISOString(),
        validUntil: new Date(form.validUntil).toISOString(),
        licensePlate: form.licensePlate || undefined,
        destinationUnitId: form.destinationUnitId || undefined,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Gagal mendaftarkan pengunjung");
      setSubmitting(false);
      return;
    }

    router.push("/resident/visitors");
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-6">Daftarkan Pengunjung</h1>

      <form onSubmit={handleSubmit} className="max-w-md space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Nama Pengunjung</label>
          <input
            required
            className="w-full h-10 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 text-sm"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Nama lengkap"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Plat Nomor (opsional)</label>
          <input
            className="w-full h-10 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 text-sm"
            value={form.licensePlate}
            onChange={(e) => setForm({ ...form, licensePlate: e.target.value })}
            placeholder="B 1234 XYZ"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Unit Tujuan (opsional)</label>
          <input
            className="w-full h-10 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 text-sm"
            value={form.destinationUnitId}
            onChange={(e) => setForm({ ...form, destinationUnitId: e.target.value })}
            placeholder="A-12"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Berlaku Dari</label>
          <input
            required
            type="datetime-local"
            className="w-full h-10 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 text-sm"
            value={form.validFrom}
            onChange={(e) => setForm({ ...form, validFrom: e.target.value })}
            min={tomorrowStr}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Berlaku Sampai</label>
          <input
            required
            type="datetime-local"
            className="w-full h-10 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 text-sm"
            value={form.validUntil}
            onChange={(e) => setForm({ ...form, validUntil: e.target.value })}
            min={form.validFrom || tomorrowStr}
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 px-4 py-2 text-sm font-medium disabled:opacity-50"
        >
          {submitting ? "Mendaftarkan..." : "Daftarkan Pengunjung"}
        </button>
      </form>
    </div>
  );
}