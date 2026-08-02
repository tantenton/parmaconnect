"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCommunityConfig } from "@/providers/config-provider";

const residentNavItems = [
  { label: "Dasbor Warga", href: "/resident/dashboard", icon: "⌂" },
  { label: "Keluarga Saya", href: "/resident/household", icon: "⌬" },
  { label: "Laporan Saya", href: "/resident/reports", icon: "▣" },
  { label: "Pengumuman", href: "/resident/announcements", icon: "▤" },
  { label: "Acara", href: "/resident/events", icon: "◐" },
  { label: "Kendaraan", href: "/resident/vehicles", icon: "🚗" },
  { label: "Tamu", href: "/resident/visitors", icon: "👥" },
  { label: "Paket", href: "/resident/packages", icon: "📦" },
  { label: "Kontak Penting", href: "/resident/contacts", icon: "✆" },
  { label: "Informasi", href: "/resident/info", icon: "✦" },
  { label: "Tata Tertib", href: "/resident/governance", icon: "📜" },
];

function ResidentSidebar({ close }: { close?: () => void }) {
  const pathname = usePathname();
  const config = useCommunityConfig();

  return (
    <aside className="w-64 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shrink-0 hidden lg:flex flex-col">
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-emerald-50 dark:bg-emerald-950/20">
        <Link href="/resident/dashboard" className="font-bold text-emerald-900 dark:text-emerald-100">
          {config.applicationName}
        </Link>
        <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">Portal Warga</p>
      </div>
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {residentNavItems.map((item) => {
          const active = pathname === item.href || (item.href !== "/resident/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={close}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                active
                  ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/50 dark:text-emerald-100 font-medium"
                  : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:text-zinc-50 dark:hover:bg-zinc-800/50"
              }`}
            >
              <span className="w-5 text-center">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
        <Link
          href="/"
          className="text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
        >
          ← Beranda
        </Link>
      </div>
    </aside>
  );
}

export default function ResidentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex bg-zinc-50 dark:bg-zinc-950">
      <ResidentSidebar />
      <main className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}