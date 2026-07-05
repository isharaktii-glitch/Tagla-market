"use client";
import { useState, useEffect } from "react";

type Category = { id: string; name_en: string; name_si: string; name_ta: string };

export default function ProductForm({ onCreated }: { onCreated: () => void }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [marketPrice, setMarketPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [isUnlimited, setIsUnlimited] = useState(false);
  const [stockQty, setStockQty] = useState("");
  const [commissionBased, setCommissionBased] = useState(true);
  const [commissionPercent, setCommissionPercent] = useState("10");
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => setCategories(d.categories || []));
  }, []);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    const uploaded: string[] = [];
    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.url) uploaded.push(data.url);
    }
    setImages((prev) => [...prev, ...uploaded]);
    setUploading(false);
  }

  function removeImage(idx: number) {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!name || !basePrice) {
      setError("Product name and price are required");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          base_price: parseFloat(basePrice),
          market_price: marketPrice ? parseFloat(marketPrice) : null,
          category_id: categoryId || null,
          is_unlimited_stock: isUnlimited,
          stock_qty: isUnlimited ? null : parseInt(stockQty || "0"),
          is_commission_based: commissionBased,
          commission_percent: parseFloat(commissionPercent),
          images,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create listing");
        setSaving(false);
        return;
      }
      setSuccess(`✅ Listed! Order/Listing Code: ${data.product.listing_code}`);
      setName("");
      setDescription("");
      setBasePrice("");
      setMarketPrice("");
      setStockQty("");
      setImages([]);
      onCreated();
    } catch {
      setError("Network error");
    }
    setSaving(false);
  }

  return (
    <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-6 space-y-4">
      <h2 className="text-xl font-bold text-white mb-2">📦 List a New Product</h2>

      <input
        required
        placeholder="Product name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full px-4 py-3 rounded-lg bg-galaxy-900/60 border border-galaxy-400/30 focus:border-accent outline-none text-white"
      />

      <textarea
        placeholder="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={3}
        className="w-full px-4 py-3 rounded-lg bg-galaxy-900/60 border border-galaxy-400/30 focus:border-accent outline-none text-white"
      />

      <select
        value={categoryId}
        onChange={(e) => setCategoryId(e.target.value)}
        className="w-full px-4 py-3 rounded-lg bg-galaxy-900/60 border border-galaxy-400/30 focus:border-accent outline-none text-white"
      >
        <option value="">Select category (optional)</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>{c.name_en}</option>
        ))}
      </select>

      <div className="grid grid-cols-2 gap-4">
        <input
          required
          type="number"
          step="0.01"
          placeholder="Your price (Rs.)"
          value={basePrice}
          onChange={(e) => setBasePrice(e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-galaxy-900/60 border border-galaxy-400/30 focus:border-accent outline-none text-white"
        />
        <input
          type="number"
          step="0.01"
          placeholder="Current market price (optional)"
          value={marketPrice}
          onChange={(e) => setMarketPrice(e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-galaxy-900/60 border border-galaxy-400/30 focus:border-accent outline-none text-white"
        />
      </div>

      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-galaxy-300">
          <input
            type="checkbox"
            checked={isUnlimited}
            onChange={(e) => setIsUnlimited(e.target.checked)}
          />
          Unlimited stock
        </label>
        {!isUnlimited && (
          <input
            type="number"
            placeholder="Stock quantity"
            value={stockQty}
            onChange={(e) => setStockQty(e.target.value)}
            className="flex-1 px-4 py-2 rounded-lg bg-galaxy-900/60 border border-galaxy-400/30 focus:border-accent outline-none text-white text-sm"
          />
        )}
      </div>

      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-galaxy-300">
          <input
            type="checkbox"
            checked={commissionBased}
            onChange={(e) => setCommissionBased(e.target.checked)}
          />
          Commission-based for resellers
        </label>
        {commissionBased && (
          <input
            type="number"
            placeholder="Commission %"
            value={commissionPercent}
            onChange={(e) => setCommissionPercent(e.target.value)}
            className="w-28 px-3 py-2 rounded-lg bg-galaxy-900/60 border border-galaxy-400/30 focus:border-accent outline-none text-white text-sm"
          />
        )}
      </div>

      <div>
        <label className="block text-sm text-galaxy-300 mb-2">Product Images</label>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleImageUpload}
          className="text-sm text-galaxy-300"
        />
        {uploading && <p className="text-xs text-accent mt-1">Uploading...</p>}
        {images.length > 0 && (
          <div className="flex gap-2 mt-3 flex-wrap">
            {images.map((img, i) => (
              <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-galaxy-400/30">
                <img src={img} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute top-0 right-0 bg-red-600 text-white text-xs w-5 h-5 flex items-center justify-center"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}
      {success && <p className="text-accent text-sm">{success}</p>}

      <button
        type="submit"
        disabled={saving}
        className="btn-primary w-full py-3 rounded-lg disabled:opacity-50"
      >
        {saving ? "Saving..." : "✅ List Product"}
      </button>
    </form>
  );
}
