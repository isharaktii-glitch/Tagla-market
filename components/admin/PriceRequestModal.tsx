"use client";
import { useState } from "react";

export default function PriceRequestModal({
  product,
  onClose,
  onSent,
}: {
  product: { id: string; name: string; seller_id: string; base_price: string };
  onClose: () => void;
  onSent: () => void;
}) {
  const [percent, setPercent] = useState("-20");
  const [applyToAll, setApplyToAll] = useState(false);
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState("");

  const currentPrice = parseFloat(product.base_price);
  const proposedPrice = currentPrice * (1 + parseFloat(percent || "0") / 100);

  async function handleSend() {
    setSending(true);
    const res = await fetch("/api/price-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        product_id: product.id,
        seller_id: product.seller_id,
        requested_percent: parseFloat(percent),
        apply_to_all_seller_products: applyToAll,
      }),
    });
    setSending(false);
    if (res.ok) {
      setMsg("✅ Request sent to seller!");
      onSent();
      setTimeout(() => onClose(), 1500);
    } else {
      setMsg("❌ Failed to send request");
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
      <div className="glass-card rounded-2xl p-6 w-full max-w-sm">
        <h3 className="font-bold text-white mb-1">📩 Request Price Change</h3>
        <p className="text-xs text-galaxy-400 mb-4">{product.name}</p>

        <label className="text-sm text-galaxy-300">Change (%)</label>
        <input
          type="number"
          value={percent}
          onChange={(e) => setPercent(e.target.value)}
          className="w-full mt-1 mb-3 px-4 py-3 rounded-lg bg-galaxy-900/60 border border-galaxy-400/30 focus:border-accent outline-none text-white"
        />

        <div className="bg-galaxy-900/60 rounded-lg p-3 text-sm mb-3">
          <div className="flex justify-between text-galaxy-300">
            <span>Current price</span>
            <span>Rs. {currentPrice.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-white font-bold mt-1">
            <span>Proposed price</span>
            <span className="text-accent">Rs. {proposedPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm text-galaxy-300 mb-4">
          <input type="checkbox" checked={applyToAll} onChange={(e) => setApplyToAll(e.target.checked)} />
          Apply to ALL products by this seller
        </label>

        {msg && <p className="text-accent text-sm mb-3">{msg}</p>}

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2 rounded-lg bg-galaxy-800 text-galaxy-300 text-sm">
            Cancel
          </button>
          <button onClick={handleSend} disabled={sending} className="flex-1 btn-primary py-2 rounded-lg text-sm disabled:opacity-50">
            {sending ? "Sending..." : "Send Request"}
          </button>
        </div>
      </div>
    </div>
  );
}
