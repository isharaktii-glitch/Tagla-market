"use client";
import { useState } from "react";
import { useSearchParams, useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import StarField from "@/components/StarField";

export default function ResetPasswordPage() {
  const t = useTranslations("auth");
  const c = useTranslations("common");
  const searchParams = useSearchParams();
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, newPassword: password }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Failed");
      return;
    }
    setDone(true);
    setTimeout(() => router.push(`/${locale}/login`), 2000);
  }

  return (
    <main className="relative min-h-screen flex items-center justify-center bg-galaxy-radial px-4">
      <StarField />
      <div className="relative z-10 w-full max-w-md glass-card rounded-2xl p-8">
        <h1 className="text-2xl font-bold mb-6 text-center">{t("newPassword")}</h1>
        {done ? (
          <p className="text-center text-accent">{t("resetSuccess")} ✅</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              required
              type="password"
              placeholder={t("newPassword")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-galaxy-900/60 border border-galaxy-400/30 focus:border-accent outline-none text-white"
            />
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button type="submit" className="btn-primary w-full py-3 rounded-lg">
              {c("submit")}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
