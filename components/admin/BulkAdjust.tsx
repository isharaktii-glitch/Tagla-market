"use client";
import { useState, useEffect } from "react";

type Category = { id: string; name_en: string; price_adjust_percent: string };

export default function BulkAdjust() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [globalPercent, setGlobalPercent] = useState("0");
  const [catPercent, setCatPercent] = useState<Record<string, string>>({});
  const [savingAll, setSavingAll] = useState(false);
  const [savingCat, setSavingCat] = useState<string | null>(null);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => setCategories(d.categories || []));
  }, []);

  async function saveAll() {
    setSavingAll(true);
    await fetch("/api/admin/products/adjust-all", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ percent: parseFloat(globalPercent) }),
    });
    setSavingAll(false);
    setMsg("✅ All categories & products updated!");
    setTimeout(() => setMsg(""), 3000);
  }

  async function saveCategory(catId: string) {
    setSavingCat(catId);
    await fetch(`/api/admin/categories/${catId}/adjust`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ percent: parseFloat(catPercent[catId] || "0") }),
    });
    setSavingCat(null);
    setMsg("✅ Category updated!");
    setTimeout(() => setMsg(""), 3000);
  }

  return (
    <div className="glass-card rounded-2xl p-6 space-y-6">
      <div>
        <h3 className="font-bold text-white mb-2">🌍 Adjust ALL Categories at Once</h3>
        <div className="flex gap-3">
          <input
            type="number"
            placeholder="% e.g. 20"
            value={globalPercent}
            onChange={(e) => setGlobalPercent(e.target.value)}
            className="flex-1 px-4 py-2 rounded-lg bg-galaxy-900/60 border border-galaxy-400/30 focus:border-accent outline-none text-white text-sm"
          />
          <button onClick={saveAll} disabled={savingAll} className="btn-primary px-5 py-2 rounded-lg text-sm disabled:opacity-50">
            {savingAll ? "..." : "Apply to All"}
          </button>
        </div>
      </div>

      <div>
        <h3 className="font-bold text-white mb-2">📁 Adjust by Category</h3>
        <div className="space-y-2">
          {categories.map((c) => (
            <div key={c.id} className="flex items-center gap-3">
              <span className="text-sm text-galaxy-300 flex-1">{c.name_en}</span>
              <input
                type="number"
                placeholder="%"
                value={catPercent[c.id] ?? c.price_adjust_percent ?? "0"}
                onChange={(e) => setCatPercent({ ...catPercent, [c.id]: e.target.value })}
                className="w-24 px-3 py-2 rounded-lg bg-galaxy-900/60 border border-galaxy-400/30 focus:border-accent outline-none text-white text-sm"
              />
              <button
                onClick={() => saveCategory(c.id)}
                disabled={savingCat === c.id}
                className="text-xs px-3 py-2 rounded-lg bg-accent/20 text-accent hover:bg-accent/30 disabled:opacity-50"
              >
                {savingCat === c.id ? "..." : "Apply"}
              </button>
            </div>
          ))}
        </div>
      </div>

      {msg && <p className="text-accent text-sm">{msg}</p>}
    </div>
  );
}
