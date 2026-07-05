"use client";
import { useEffect, useState } from "react";

type Product = {
  id: string;
  listing_code: string;
  name: string;
  base_price: string;
  market_price: string | null;
  stock_qty: number | null;
  is_unlimited_stock: boolean;
  status: string;
  images: string[] | null;
  created_at: string;
};

export default function ProductList({ refreshKey }: { refreshKey: number }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch("/api/products")
      .then((r) => r.json())
      .then((d) => setProducts(d.products || []))
      .finally(() => setLoading(false));
  }, [refreshKey]);

  if (loading) return <p className="text-galaxy-400 text-sm">Loading listings...</p>;
  if (products.length === 0) return <p className="text-galaxy-400 text-sm">No listings yet. Create your first one above!</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {products.map((p) => (
        <div key={p.id} className="glass-card rounded-xl p-4">
          <div className="w-full h-32 rounded-lg bg-galaxy-900/60 mb-3 overflow-hidden flex items-center justify-center">
            {p.images && p.images.length > 0 ? (
              <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-galaxy-500 text-xs">No image</span>
            )}
          </div>
          <h3 className="font-bold text-white text-sm">{p.name}</h3>
          <p className="text-xs text-galaxy-400 mt-1">Code: {p.listing_code}</p>
          <div className="flex justify-between items-center mt-2">
            <span className="text-accent font-bold">Rs. {parseFloat(p.base_price).toLocaleString()}</span>
            <span className={`text-xs px-2 py-1 rounded-full ${p.status === "active" ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"}`}>
              {p.status}
            </span>
          </div>
          <p className="text-xs text-galaxy-500 mt-1">
            {p.is_unlimited_stock ? "Unlimited stock" : `Stock: ${p.stock_qty ?? 0}`}
          </p>
        </div>
      ))}
    </div>
  );
}
