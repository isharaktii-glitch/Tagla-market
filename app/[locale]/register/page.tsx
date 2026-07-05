"use client";
import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import StarField from "@/components/StarField";
import Link from "next/link";

export default function RegisterPage() {
  const t = useTranslations("auth");
  const c = useTranslations("common");
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;

  const [step, setStep] = useState<1 | 2>(1);
  const [role, setRole] = useState<"seller" | "reseller" | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function selectRole(r: "seller" | "reseller") {
    setRole(r);
    setStep(2);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, role }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong");
        setLoading(false);
        return;
      }
      router.push(`/${locale}?registered=true`);
    } catch {
      setError("Network error");
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen flex items-center justify-center bg-galaxy-radial px-4 py-12">
      <StarField />
      <div className="relative z-10 w-full max-w-md glass-card rounded-2xl p-8">
        <Link href={`/${locale}`} className="text-xs text-galaxy-400 hover:text-white mb-4 inline-block">
          ← {c("back")}
        </Link>
        <h1 className="text-2xl font-bold mb-6 text-center">{t("registerTitle")}</h1>

        {step === 1 && (
          <div className="space-y-4">
            <p className="text-sm text-galaxy-300 text-center mb-4">{t("chooseRole")}</p>
            <button
              onClick={() => selectRole("seller")}
              className="w-full text-left p-4 rounded-xl border border-galaxy-400/30 hover:border-accent hover:bg-galaxy-800/50 transition"
            >
              <div className="font-bold text-white">📦 {t("roleSeller")}</div>
              <div className="text-xs text-galaxy-400 mt-1">{t("roleSellerDesc")}</div>
            </button>
            <button
              onClick={() => selectRole("reseller")}
              className="w-full text-left p-4 rounded-xl border border-galaxy-400/30 hover:border-accent hover:bg-galaxy-800/50 transition"
            >
              <div className="font-bold text-white">🔁 {t("roleReseller")}</div>
              <div className="text-xs text-galaxy-400 mt-1">{t("roleResellerDesc")}</div>
            </button>
          </div>
        )}

        {step === 2 && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-xs text-galaxy-400 hover:text-white"
            >
              ← {t("chooseRole")}
            </button>
            <input
              required
              placeholder={t("fullName")}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-3 rounded-lg bg-galaxy-900/60 border border-galaxy-400/30 focus:border-accent outline-none text-white"
            />
            <input
              required
              type="email"
              placeholder={c("email")}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-4 py-3 rounded-lg bg-galaxy-900/60 border border-galaxy-400/30 focus:border-accent outline-none text-white"
            />
            <input
              placeholder={c("phone")}
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
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
            <input
              required
              type="password"
              placeholder={t("confirmPassword")}
              value={form.confirm}
              onChange={(e) => setForm({ ...form, confirm: e.target.value })}
              className="w-full px-4 py-3 rounded-lg bg-galaxy-900/60 border border-galaxy-400/30 focus:border-accent outline-none text-white"
            />
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 rounded-lg disabled:opacity-50"
            >
              {loading ? c("loading") : c("register")}
            </button>
          </form>
        )}

        <p className="text-center text-sm text-galaxy-400 mt-6">
          {t("alreadyHaveAccount")}{" "}
          <Link href={`/${locale}/login`} className="text-accent hover:underline">
            {c("login")}
          </Link>
        </p>
      </div>
    </main>
  );
}
