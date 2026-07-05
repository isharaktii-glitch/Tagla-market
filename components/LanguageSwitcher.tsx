"use client";
import { usePathname, useRouter } from "next/navigation";
import { useLocale } from "next-intl";

const locales = [
  { code: "si", label: "සිං" },
  { code: "ta", label: "தமி" },
  { code: "en", label: "EN" },
];

export default function LanguageSwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  const currentLocale = useLocale();

  function switchLocale(code: string) {
    const segments = pathname.split("/");
    segments[1] = code;
    router.push(segments.join("/"));
  }

  return (
    <div className="flex gap-1 bg-galaxy-800/60 rounded-full p-1 border border-galaxy-400/20">
      {locales.map((l) => (
        <button
          key={l.code}
          onClick={() => switchLocale(l.code)}
          className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
            currentLocale === l.code
              ? "bg-accent text-galaxy-950"
              : "text-galaxy-300 hover:text-white"
          }`}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
