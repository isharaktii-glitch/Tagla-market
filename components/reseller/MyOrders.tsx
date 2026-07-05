"use client";
import { useEffect, useState } from "react";

type Order = {
  id: string;
  order_code: string;
  product_name: string;
  seller_name: string;
  customer_name: string;
  total_price: string;
  delivery_status: string;
  delivered_confirmed_by_placer: boolean;
  created_at: string;
};

export default function MyOrders({ refreshKey }: { refreshKey: number }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    fetch("/api/orders")
      .then((r) => r.json())
      .then((d) => setOrders(d.orders || []))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, [refreshKey]);

  async function confirmDelivery(orderId: string) {
    await fetch(`/api/orders/${orderId}/confirm-delivery`, { method: "POST" });
    load();
  }

  if (loading) return <p className="text-galaxy-400 text-sm">Loading orders...</p>;
  if (orders.length === 0) return <p className="text-galaxy-400 text-sm">No orders placed yet.</p>;

  return (
    <div className="space-y-3">
      {orders.map((o) => (
        <div key={o.id} className="glass-card rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div>
            <p className="text-accent text-xs font-mono">{o.order_code}</p>
            <p className="text-white font-medium">{o.product_name}</p>
            <p className="text-xs text-galaxy-400">Seller: {o.seller_name} • Customer: {o.customer_name}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-green-400 font-bold">Rs. {parseFloat(o.total_price).toLocaleString()}</span>
            <span className={`text-xs px-2 py-1 rounded-full ${o.delivery_status === "delivered" ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"}`}>
              {o.delivery_status}
            </span>
            {o.delivery_status === "delivered" && !o.delivered_confirmed_by_placer && (
              <button
                onClick={() => confirmDelivery(o.id)}
                className="text-xs px-3 py-1 rounded-full bg-accent/20 text-accent hover:bg-accent/30"
              >
                Confirm Received
              </button>
            )}
            {o.delivered_confirmed_by_placer && (
              <span className="text-xs text-accent">✓ Confirmed</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
