"use client";
import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import PaymentMethodSelector from "./PaymentMethodSelector";

type Product = {
  id: string;
  name: string;
  display_price: string;
  is_commission_based: boolean;
};

export default function OrderModal({
  product,
  onClose,
  onPlaced,
}: {
  product: Product;
  onClose: () => void;
  onPlaced: (orderCode: string) => void;
}) {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;

  const [resellerMode, setResellerMode] = useState(false);
  const [marginPercent, setMarginPercent] = useState("10");
  const [customerName, setCustomerName] = useState("");
  const [customerContact, setCustomerContact] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [quantity, setQuantity] = useState("1");
  const [paymentMethod, setPaymentMethod] = useState("bank_transfer");
  const [locating, setLocating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function shareLocation() {
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
        setLocating(false);
      },
      () => {
        setError("Could not get location. Please allow location access.");
        setLocating(false);
      }
    );
  }

  const basePrice = parseFloat(product.display_price);
  const margin = resellerMode ? parseFloat(marginPercent || "0") : 0;
  const finalUnitPrice = basePrice * (1 + margin / 100);
  const total = finalUnitPrice * parseInt(quantity || "1");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!customerName || !customerContact) {
      setError("Customer name and contact are required");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: product.id,
          customer_name: customerName,
          customer_contact: customerContact,
          customer_address: customerAddress,
          customer_location_lat: lat,
          customer_location_lng: lng,
          quantity: parseInt(quantity || "1"),
          reseller_margin_percent: margin,
          is_reseller_mode: resellerMode,
          payment_method: paymentMethod,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to place order");
        setSaving(false);
        return;
      }

      if (paymentMethod === "payhere") {
        router.push(`/${locale}/checkout/${data.order.id}`);
        return;
      }

      onPlaced(data.order.order_code);
    } catch {
      setError("Network error");
    }
    setSaving(false);
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4 overflow-y-auto py-8">
      <div className="glass-card rounded-2xl p-6 w-full max-w-md">
        <h3 className="font-bold text-white mb-1">🛒 Place Order</h3>
        <p className="text-xs text-galaxy-400 mb-4">{product.name}</p>

        {product.is_commission_based && (
          <label className="flex items-center gap-2 text-sm text-galaxy-300 mb-4">
            <input type="checkbox" checked={resellerMode} onChange={(e) => setResellerMode(e.target.checked)} />
            Sell as Reseller (add your margin)
          </label>
        )}

        {resellerMode && (
          <input
            type="number"
            placeholder="Your margin %"
            value={marginPercent}
            onChange={(e) => setMarginPercent(e.target.value)}
            className="w-full mb-3 px-4 py-2 rounded-lg bg-galaxy-900/60 border border-galaxy-400/30 focus:border-accent outline-none text-white text-sm"
          />
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            required
            placeholder="Customer name"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-galaxy-900/60 border border-galaxy-400/30 focus:border-accent outline-none text-white text-sm"
          />
          <input
            required
            placeholder="Customer contact number"
            value={customerContact}
            onChange={(e) => setCustomerContact(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-galaxy-900/60 border border-galaxy-400/30 focus:border-accent outline-none text-white text-sm"
          />
          <textarea
            placeholder="Delivery address"
            value={customerAddress}
            onChange={(e) => setCustomerAddress(e.target.value)}
            rows={2}
            className="w-full px-4 py-2 rounded-lg bg-galaxy-900/60 border border-galaxy-400/30 focus:border-accent outline-none text-white text-sm"
          />
          <button
            type="button"
            onClick={shareLocation}
            className="text-xs px-3 py-2 rounded-lg bg-galaxy-800 text-accent border border-accent/30"
          >
            {locating ? "Getting location..." : lat ? "📍 Location Shared ✓" : "📍 Share Location"}
          </button>
          <input
            type="number"
            min="1"
            placeholder="Quantity"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-galaxy-900/60 border border-galaxy-400/30 focus:border-accent outline-none text-white text-sm"
          />

          <PaymentMethodSelector value={paymentMethod} onChange={setPaymentMethod} />

          <div className="bg-galaxy-900/60 rounded-lg p-3 text-sm">
            <div className="flex justify-between text-galaxy-300">
              <span>Unit price</span>
              <span>Rs. {finalUnitPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-white font-bold mt-1">
              <span>Total</span>
              <span className="text-accent">Rs. {total.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
            </div>
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-2 rounded-lg bg-galaxy-800 text-galaxy-300 text-sm">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="flex-1 btn-primary py-2 rounded-lg text-sm disabled:opacity-50">
              {saving ? "Placing..." : paymentMethod === "payhere" ? "Continue to Payment" : "Confirm Order"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
