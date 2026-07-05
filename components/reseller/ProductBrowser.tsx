"use client";
import { useEffect, useState } from "react";

type Product = {
  id: string;
  name: string;
  display_price: string;
  images: string[] | null;
  seller_name: string;
  is_commission_based: boolean;
  commission_percent: string;
};

export default function ProductBrowser({ onOrder }: { onOrder: (p: Product) => void }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((d) => setProducts(d.products || []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-galaxy-400 text-sm">Loading products...</p>;
  if (products.length === 0) return <p className="text-galaxy-400 text-sm">No products available yet.</p>;

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
          <p className="text-xs text-galaxy-400">by {p.seller_name}</p>
          <div className="flex justify-between items-center mt-2">
            <span className="text-accent font-bold">Rs. {parseFloat(p.display_price).toLocaleString()}</span>
            {p.is_commission_based && (
              <span className="text-xs px-2 py-1 rounded-full bg-galaxy-700 text-galaxy-300">
                {p.commission_percent}% comm.
              </span>
            )}
          </div>
          <button
            onClick={() => onOrder(p)}
            className="btn-primary w-full mt-3 py-2 rounded-lg text-sm"
          >
            Order Now
          </button>
        </div>
      ))}
    </div>
  );
}
