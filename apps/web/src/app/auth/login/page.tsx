"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCommunityConfig } from "@/providers/config-provider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui";
import { Input } from "@/components/ui";

export default function LoginPage() {
  const router = useRouter();
  const config = useCommunityConfig();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Gagal masuk");
        return;
      }

      // Redirect based on role
      const adminRoles = ["SUPER_ADMIN", "ADMIN", "DOCUMENT_ADMIN", "FINANCE_ADMIN", "SECURITY_OFFICER", "STAFF"];
      if (adminRoles.includes(data.user.role)) {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    } catch {
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>{config.applicationName}</CardTitle>
          <CardDescription>Masuk ke akun Anda</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-3 text-sm text-red-600 dark:text-red-400">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="admin@clusterparma.local"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Kata Sandi
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 rounded-lg bg-zinc-900 text-zinc-50 font-medium hover:bg-zinc-800 disabled:opacity-50 transition-colors dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              {loading ? "Memuat..." : "Masuk"}
            </button>

            <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
              Belum punya akun?{" "}
              <Link href="/auth/register" className="text-zinc-900 dark:text-zinc-50 underline underline-offset-2 hover:no-underline">
                Daftar
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}