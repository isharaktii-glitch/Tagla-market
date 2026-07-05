"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import Link from "next/link";
import StarField from "@/components/StarField";

export default function ForgotPasswordPage() {
  const t = useTranslations("auth");
  const c = useTranslations("common");
  const params = useParams();
  const locale = params.locale as string;

  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [resetLink, setResetLink] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    setLoading(false);
    setSent(true);
    if (data.resetLink) setResetLink(data.resetLink);
  }

  return (
    <main className="relative min-h-screen flex items-center justify-center bg-galaxy-radial px-4">
      <StarField />
      <div className="relative z-10 w-full max-w-md glass-card rounded-2xl p-8">
        <Link href={`/${locale}/login`} className="text-xs text-galaxy-400 hover:text-white mb-4 inline-block">
          ← {c("back")}
        </Link>
        <h1 className="text-2xl font-bold mb-2 text-center">{t("resetPasswordTitle")}</h1>
        <p className="text-sm text-galaxy-400 text-center mb-6">{t("resetPasswordDesc")}</p>

        {!sent ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              required
              type="email"
              placeholder={c("email")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-galaxy-900/60 border border-galaxy-400/30 focus:border-accent outline-none text-white"
            />
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 rounded-lg disabled:opacity-50"
            >
              {loading ? c("loading") : t("sendResetLink")}
            </button>
          </form>
        ) : (
          <div className="text-center text-sm text-galaxy-300">
            <p>✅ If that email exists, reset instructions have been generated.</p>
            {resetLink && (
              <Link href={`/${locale}${resetLink}`} className="text-accent underline mt-3 block">
                Click here to reset (dev mode)
              </Link>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
