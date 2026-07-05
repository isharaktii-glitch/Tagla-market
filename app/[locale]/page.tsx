import Link from "next/link";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import StarField from "@/components/StarField";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default async function LandingPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const t = await getTranslations("landing");
  const c = await getTranslations("common");

  return (
    <main className="relative min-h-screen overflow-hidden bg-galaxy-radial">
      <StarField />

      {/* Orbit rings decoration */}
      <div className="pointer-events-none absolute -top-40 -right-40 w-[500px] h-[500px] orbit-ring animate-spin-slow" />
      <div className="pointer-events-none absolute -bottom-52 -left-52 w-[600px] h-[600px] orbit-ring animate-spin-reverse" />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 md:px-12 py-6">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-galaxy-400 to-accent animate-pulse-slow" />
          <span className="text-lg font-bold tracking-wide">{c("siteName")}</span>
        </div>
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <Link
            href={`/${locale}/login`}
            className="text-sm font-medium text-galaxy-300 hover:text-white transition"
          >
            {c("login")}
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 flex flex-col items-center text-center px-6 pt-16 md:pt-28 pb-24">
        <span className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-accent animate-twinkle">
          {c("brand")}
        </span>
        <h1 className="max-w-3xl text-4xl md:text-6xl font-extrabold leading-tight bg-clip-text text-transparent bg-gradient-to-br from-white via-galaxy-300 to-accent animate-float">
          {t("heroTitle")}
        </h1>
        <p className="mt-6 max-w-xl text-galaxy-300 text-lg">
          {t("heroSubtitle")}
        </p>
        <p className="mt-3 max-w-lg text-sm text-galaxy-400">
          {t("heroDescription")}
        </p>

        <Link
          href={`/${locale}/register`}
          className="btn-primary mt-10 px-10 py-4 rounded-full text-lg shadow-2xl"
        >
          🚀 {t("ctaButton")}
        </Link>

        {/* Feature glass cards */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
          {[
            { icon: "🛍️", title: "Sell", desc: "List products & manage your store" },
            { icon: "🔗", title: "Resell", desc: "Earn commission reselling listings" },
            { icon: "🌍", title: "3 Languages", desc: "සිංහල · தமிழ் · English" },
          ].map((f) => (
            <div key={f.title} className="glass-card rounded-2xl p-6">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-bold text-white mb-1">{f.title}</h3>
              <p className="text-sm text-galaxy-300">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
