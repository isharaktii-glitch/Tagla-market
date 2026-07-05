"use client";
import { useEffect, useState } from "react";

type Order = {
  id: string;
  order_code: string;
  product_name: string;
  listing_code: string;
  seller_name: string;
  placed_by_name: string;
  customer_name: string;
  total_price: string;
  delivery_status: string;
  payment_status: string;
  created_at: string;
};

export default function OrdersTable() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/orders")
      .then((r) => r.json())
      .then((d) => setOrders(d.orders || []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-galaxy-400 text-sm">Loading...</p>;
  if (orders.length === 0) return <p className="text-galaxy-400 text-sm">No orders yet.</p>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-galaxy-400 border-b border-galaxy-400/20">
            <th className="py-2 pr-4">Order ID</th>
            <th className="py-2 pr-4">Product</th>
            <th className="py-2 pr-4">Seller</th>
            <th className="py-2 pr-4">Placed By</th>
            <th className="py-2 pr-4">Customer</th>
            <th className="py-2 pr-4">Total</th>
            <th className="py-2 pr-4">Delivery</th>
            <th className="py-2 pr-4">Payment</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id} className="border-b border-galaxy-400/10">
              <td className="py-3 pr-4 text-accent text-xs font-mono">{o.order_code}</td>
              <td className="py-3 pr-4 text-white">{o.product_name}</td>
              <td className="py-3 pr-4 text-galaxy-300">{o.seller_name}</td>
              <td className="py-3 pr-4 text-galaxy-300">{o.placed_by_name}</td>
              <td className="py-3 pr-4 text-galaxy-300">{o.customer_name}</td>
              <td className="py-3 pr-4 text-green-400 font-bold">Rs. {parseFloat(o.total_price).toLocaleString()}</td>
              <td className="py-3 pr-4">
                <span className={`text-xs px-2 py-1 rounded-full ${o.delivery_status === "delivered" ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"}`}>
                  {o.delivery_status}
                </span>
              </td>
              <td className="py-3 pr-4">
                <span className={`text-xs px-2 py-1 rounded-full ${o.payment_status === "paid" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                  {o.payment_status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
