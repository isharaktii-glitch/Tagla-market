"use client";
import { useState } from "react";

export default function PriceAdjustModal({
  product,
  onClose,
  onSaved,
}: {
  product: { id: string; name: string; admin_price_adjust_percent: string };
  onClose: () => void;
  onSaved: () => void;
}) {
  const [percent, setPercent] = useState(product.admin_price_adjust_percent || "0");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    await fetch(`/api/admin/products/${product.id}/adjust`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ percent: parseFloat(percent) }),
    });
    setSaving(false);
    onSaved();
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
      <div className="glass-card rounded-2xl p-6 w-full max-w-sm">
        <h3 className="font-bold text-white mb-1">Adjust Price</h3>
        <p className="text-xs text-galaxy-400 mb-4">{product.name}</p>
        <label className="text-sm text-galaxy-300">Price adjustment (%)</label>
        <input
          type="number"
          value={percent}
          onChange={(e) => setPercent(e.target.value)}
          className="w-full mt-1 px-4 py-3 rounded-lg bg-galaxy-900/60 border border-galaxy-400/30 focus:border-accent outline-none text-white"
        />
        <p className="text-xs text-galaxy-500 mt-2">
          e.g. 20 = increase price by 20% for customers/resellers. -10 = decrease by 10%.
        </p>
        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="flex-1 py-2 rounded-lg bg-galaxy-800 text-galaxy-300 text-sm">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving} className="flex-1 btn-primary py-2 rounded-lg text-sm disabled:opacity-50">
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
