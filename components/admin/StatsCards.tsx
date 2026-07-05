"use client";
import { useEffect, useState } from "react";

type Stats = {
  sellerCount: string;
  resellerCount: string;
  productCount: string;
  orderCount: string;
  pendingOrders: string;
  totalSales: string;
};

export default function StatsCards() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then(setStats);
  }, []);

  if (!stats) return <p className="text-galaxy-400 text-sm">Loading stats...</p>;

  const cards = [
    { label: "Sellers", value: stats.sellerCount, icon: "📦" },
    { label: "Resellers/Customers", value: stats.resellerCount, icon: "🔁" },
    { label: "Products", value: stats.productCount, icon: "🛍️" },
    { label: "Orders", value: stats.orderCount, icon: "🧾" },
    { label: "Pending Deliveries", value: stats.pendingOrders, icon: "⏳" },
    { label: "Total Sales", value: `Rs. ${parseFloat(stats.totalSales).toLocaleString()}`, icon: "💰" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
      {cards.map((c) => (
        <div key={c.label} className="glass-card rounded-xl p-4">
          <div className="text-2xl mb-1">{c.icon}</div>
          <div className="text-xl font-bold text-white">{c.value}</div>
          <div className="text-xs text-galaxy-400">{c.label}</div>
        </div>
      ))}
    </div>
  );
}
