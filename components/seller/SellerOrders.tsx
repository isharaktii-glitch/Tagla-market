"use client";
import { useEffect, useState } from "react";

type Order = {
  id: string;
  order_code: string;
  product_name: string;
  listing_code: string;
  placed_by_name: string;
  customer_name: string;
  customer_contact: string;
  customer_address: string;
  customer_location_lat: number | null;
  customer_location_lng: number | null;
  total_price: string;
  delivery_status: string;
  delivered_confirmed_by_placer: boolean;
  created_at: string;
};

export default function SellerOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    fetch("/api/orders")
      .then((r) => r.json())
      .then((d) => setOrders(d.orders || []))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  async function markDelivered(orderId: string) {
    await fetch(`/api/orders/${orderId}/delivery`, { method: "POST" });
    load();
  }

  if (loading) return <p className="text-galaxy-400 text-sm">Loading orders...</p>;
  if (orders.length === 0) return <p className="text-galaxy-400 text-sm">No orders received yet.</p>;

  return (
    <div className="space-y-3">
      {orders.map((o) => (
        <div key={o.id} className="glass-card rounded-xl p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div>
              <p className="text-accent text-xs font-mono">{o.order_code}</p>
              <p className="text-white font-medium">{o.product_name}</p>
              <p className="text-xs text-galaxy-400">
                Placed by: {o.placed_by_name} • Customer: {o.customer_name} ({o.customer_contact})
              </p>
              {o.customer_address && (
                <p className="text-xs text-galaxy-500 mt-1">📍 {o.customer_address}</p>
              )}
              {o.customer_location_lat && o.customer_location_lng && (
                <a
                  href={`https://www.google.com/maps?q=${o.customer_location_lat},${o.customer_location_lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-accent underline"
                >
                  View shared location on map
                </a>
              )}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-green-400 font-bold">Rs. {parseFloat(o.total_price).toLocaleString()}</span>
              <span className={`text-xs px-2 py-1 rounded-full ${o.delivery_status === "delivered" ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"}`}>
                {o.delivery_status}
              </span>
              {o.delivery_status === "pending" && (
                <button
                  onClick={() => markDelivered(o.id)}
                  className="text-xs px-3 py-1 rounded-full bg-accent/20 text-accent hover:bg-accent/30"
                >
                  Mark Delivered
                </button>
              )}
              {o.delivered_confirmed_by_placer && (
                <span className="text-xs text-accent">✓ Receipt Confirmed</span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
