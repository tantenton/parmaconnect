"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useCommunityConfig } from "@/providers/config-provider";
import { Card, CardContent } from "@/components/ui";

export default function Home() {
  const t = useTranslations();
  const config = useCommunityConfig();

  const features = [
    { key: "info" as const },
    { key: "report" as const },
    { key: "billing" as const },
    { key: "vehicles" as const },
    { key: "documents" as const },
    { key: "security" as const },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-zinc-950">
      {/* Header */}
      <header className="border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <span className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
            {config.applicationName}
          </span>
          <nav className="flex items-center gap-4">
            <Link
              href="#fitur"
              className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 transition-colors"
            >
              {t("landing.exploreFeatures")}
            </Link>
            <Link
              href="/auth/login"
              className="inline-flex items-center justify-center h-9 rounded-md border border-zinc-200 bg-white px-3 text-xs font-medium text-zinc-900 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-transparent dark:text-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              {t("auth.login")}
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-24 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-4">
          {t("landing.title", { communityName: config.communityName })}
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-md mb-8">
          {t("landing.subtitle", { parentArea: config.parentArea })}
        </p>
        <Link
          href="#fitur"
          className="inline-flex items-center justify-center h-11 rounded-lg bg-zinc-900 px-8 text-base font-medium text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-colors"
        >
          {t("landing.exploreFeatures")}
        </Link>
      </main>

      {/* Feature highlights */}
      <section id="fitur" className="max-w-5xl mx-auto px-4 pb-24 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((f) => (
          <Card key={f.key}>
            <CardContent className="p-6">
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
                {t(`landing.features.${f.key}.title`)}
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {t(`landing.features.${f.key}.description`)}
              </p>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 py-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
        <p>
          {t("landing.footer.copyright", {
            year: new Date().getFullYear(),
            appName: config.applicationName,
          })}
        </p>
        <p className="mt-1">
          {t("landing.footer.tagline", {
            communityName: config.communityName,
            parentArea: config.parentArea,
          })}
        </p>
      </footer>
    </div>
  );
}
