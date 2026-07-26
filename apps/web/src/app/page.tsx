import Link from "next/link";
import { getCommunityConfig } from "@/config/community";

const config = getCommunityConfig();

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-zinc-950">
      {/* Header */}
      <header className="border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <span className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
            {config.applicationName}
          </span>
          <nav>
            <Link
              href="#fitur"
              className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 transition-colors"
            >
              Lihat Fitur
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-24 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-4">
          {config.communityName}
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-md mb-8">
          Platform manajemen komunitas untuk warga{" "}
          {config.parentArea.toLowerCase()}. Akses informasi, laporan, tagihan,
          dan fasilitas komunitas dalam satu tempat.
        </p>
        <Link
          href="#fitur"
          className="inline-flex items-center justify-center h-12 px-8 rounded-full bg-zinc-900 text-white font-medium hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-colors"
        >
          Jelajahi Fitur
        </Link>
      </main>

      {/* Feature highlights */}
      <section id="fitur" className="max-w-5xl mx-auto px-4 pb-24 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { title: "Informasi Komunitas", desc: "Pengumuman, jadwal acara, kontak penting, dan dokumen tata kelola." },
          { title: "Laporan Warga", desc: "Laporkan masalah keamanan, kebersihan, atau fasilitas umum dengan mudah." },
          { title: "Tagihan Bulanan", desc: "Lihat dan bayar iuran bulanan, riwayat pembayaran, dan tagihan tertunggak." },
          { title: "Kendaraan & Tamu", desc: "Daftarkan kendaraan dan daftarkan tamu sebelum berkunjung." },
          { title: "Arsip Dokumen", desc: "Unggah dan kelola dokumen warga dengan aman dan terenkripsi." },
          { title: "Keamanan", desc: "Portal keamanan untuk memantau lingkungan dan kunjungan tamu." },
        ].map((feature) => (
          <div
            key={feature.title}
            className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 bg-white dark:bg-zinc-950 hover:shadow-sm transition-shadow"
          >
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
              {feature.title}
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              {feature.desc}
            </p>
          </div>
        ))}
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 py-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
        <p>
          &copy; {new Date().getFullYear()} {config.applicationName}
        </p>
        <p className="mt-1">
          {config.communityName} &mdash; {config.parentArea}
        </p>
      </footer>
    </div>
  );
}
