"use client";
import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import Link from "next/link";
import StarField from "@/components/StarField";

export default function LoginPage() {
  const t = useTranslations("auth");
  const c = useTranslations("common");
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;

  const [form, setForm] = useState({ email: "", password: "" });
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
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login failed");
        setLoading(false);
        return;
      }
      const role = data.user.role;
      const path = role === "admin" ? "admin" : role === "seller" ? "seller" : "reseller";
      router.push(`/${locale}/${path}`);
    } catch {
      setError("Network error");
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen flex items-center justify-center bg-galaxy-radial px-4">
      <StarField />
      <div className="relative z-10 w-full max-w-md glass-card rounded-2xl p-8">
        <Link href={`/${locale}`} className="text-xs text-galaxy-400 hover:text-white mb-4 inline-block">
          ← {c("back")}
        </Link>
        <h1 className="text-2xl font-bold mb-6 text-center">{t("loginTitle")}</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            required
            type="email"
            placeholder={c("email")}
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full px-4 py-3 rounded-lg bg-galaxy-900/60 border border-galaxy-400/30 focus:border-accent outline-none text-white"
          />
          <input
            required
            type="password"
            placeholder={c("password")}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full px-4 py-3 rounded-lg bg-galaxy-900/60 border border-galaxy-400/30 focus:border-accent outline-none text-white"
          />
          <div className="text-right">
            <Link href={`/${locale}/forgot-password`} className="text-xs text-accent hover:underline">
              {c("forgotPassword")}
            </Link>
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 rounded-lg disabled:opacity-50"
          >
            {loading ? c("loading") : c("login")}
          </button>
        </form>
        <p className="text-center text-sm text-galaxy-400 mt-6">
          {t("noAccount")}{" "}
          <Link href={`/${locale}/register`} className="text-accent hover:underline">
            {c("register")}
          </Link>
        </p>
      </div>
    </main>
  );
}
