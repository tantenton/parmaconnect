"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCommunityConfig } from "@/providers/config-provider";

const navItems = [
  { label: "Dasbor", href: "/admin", icon: "◉" },
  { label: "Blok", href: "/admin/blocks", icon: "⊞" },
  { label: "Unit Rumah", href: "/admin/units", icon: "⌂" },
  { label: "Keluarga", href: "/admin/households", icon: "⌬" },
  { label: "Warga", href: "/admin/residents", icon: "◎" },
  { label: "Dokumen", href: "/admin/documents", icon: "□" },
  { label: "Tagihan", href: "/admin/billing", icon: "₨" },
  { label: "Pengumuman", href: "/admin/announcements", icon: "▤" },
  { label: "Laporan", href: "/admin/reports", icon: "▣" },
  { label: "Acara", href: "/admin/events", icon: "◐" },
  { label: "Kontak", href: "/admin/contacts", icon: "✆" },
  { label: "Informasi", href: "/admin/governance", icon: "✦" },
];

function Sidebar({ close }: { close?: () => void }) {
  const pathname = usePathname();
  const config = useCommunityConfig();

  return (
    <aside className="w-64 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shrink-0 hidden lg:flex flex-col">
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
        <Link href="/admin" className="font-bold text-zinc-900 dark:text-zinc-50">
          {config.applicationName}
        </Link>
        <p className="text-xs text-zinc-500 mt-1">Panel Admin</p>
      </div>
      <nav className="flex-1 p-2 space-y-1">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={close}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                active
                  ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50 font-medium"
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
          ← Kembali ke Beranda
        </Link>
      </div>
    </aside>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex bg-zinc-50 dark:bg-zinc-950">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
