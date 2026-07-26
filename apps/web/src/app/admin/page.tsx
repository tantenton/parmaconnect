"use client";

import { useCommunityConfig } from "@/providers/config-provider";

export default function AdminDashboard() {
  const config = useCommunityConfig();

  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
        Dasbor Admin
      </h1>
      <p className="text-zinc-500 dark:text-zinc-400 mb-8">
        Selamat datang di panel administrasi {config.communityName}.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { label: "Blok", href: "/admin/blocks", count: "3", desc: "Blok aktif" },
          { label: "Unit Rumah", href: "/admin/units", count: "30", desc: "Unit terdaftar" },
          { label: "Warga", href: "/admin/residents", count: "15", desc: "Warga terdaftar" },
        ].map((card) => (
          <a
            key={card.href}
            href={card.href}
            className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 bg-white dark:bg-zinc-950 hover:shadow-sm transition-shadow"
          >
            <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">{card.count}</p>
            <p className="font-medium text-zinc-700 dark:text-zinc-300 mt-1">{card.label}</p>
            <p className="text-sm text-zinc-500 mt-1">{card.desc}</p>
          </a>
        ))}
      </div>
    </div>
  );
}
