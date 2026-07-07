"use client";
import { useState, useEffect } from "react";

type Category = {
  id: string;
  name_en: string;
  name_si: string | null;
  name_ta: string | null;
  is_hidden: boolean;
};

export default function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [nameEn, setNameEn] = useState("");
  const [nameSi, setNameSi] = useState("");
  const [nameTa, setNameTa] = useState("");
  const [saving, setSaving] = useState(false);

  function load() {
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then((d) => setCategories(d.categories || []));
  }

  useEffect(() => { load(); }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name_en: nameEn, name_si: nameSi, name_ta: nameTa }),
    });
    setSaving(false);
    setNameEn(""); setNameSi(""); setNameTa("");
    load();
  }

  async function toggleHide(cat: Category) {
    await fetch(`/api/admin/categories/${cat.id}/toggle-hide`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_hidden: !cat.is_hidden }),
    });
    load();
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleAdd} className="glass-card rounded-2xl p-6 space-y-3">
        <h3 className="font-bold text-white mb-2">📁 Add New Category</h3>
        <input
          required
          placeholder="Name (English)"
          value={nameEn}
          onChange={(e) => setNameEn(e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-galaxy-900/60 border border-galaxy-400/30 focus:border-accent outline-none text-white text-sm"
        />
        <input
          placeholder="Name (Sinhala) - optional"
          value={nameSi}
          onChange={(e) => setNameSi(e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-galaxy-900/60 border border-galaxy-400/30 focus:border-accent outline-none text-white text-sm"
        />
        <input
          placeholder="Name (Tamil) - optional"
          value={nameTa}
          onChange={(e) => setNameTa(e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-galaxy-900/60 border border-galaxy-400/30 focus:border-accent outline-none text-white text-sm"
        />
        <button type="submit" disabled={saving} className="btn-primary w-full py-3 rounded-lg disabled:opacity-50">
          {saving ? "Adding..." : "Add Category"}
        </button>
      </form>

      <div className="glass-card rounded-2xl p-6">
        <h3 className="font-bold text-white mb-3">All Categories</h3>
        {categories.length === 0 ? (
          <p className="text-galaxy-400 text-sm">No categories yet.</p>
        ) : (
          <div className="space-y-2">
            {categories.map((c) => (
              <div key={c.id} className="flex items-center justify-between border-b border-galaxy-400/10 py-3">
                <div>
                  <p className="text-white font-medium">{c.name_en}</p>
                  <p className="text-xs text-galaxy-400">{c.name_si} • {c.name_ta}</p>
                </div>
                <button
                  onClick={() => toggleHide(c)}
                  className={`text-xs px-3 py-1 rounded-full ${c.is_hidden ? "bg-red-500/20 text-red-400" : "bg-green-500/20 text-green-400"}`}
                >
                  {c.is_hidden ? "🚫 Hidden" : "✅ Visible"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
