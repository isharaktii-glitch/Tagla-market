"use client";
import { useEffect, useState } from "react";

type Product = {
  id: string;
  listing_code: string;
  name: string;
  base_price: string;
  admin_price_adjust_percent: string;
  display_price: string;
  seller_id: string;
  seller_name: string;
  category_name: string | null;
  status: string;
  images: string[] | null;
};

export default function ProductsTable({
  onAdjust,
  onPriceRequest,
}: {
  onAdjust: (p: Product) => void;
  onPriceRequest: (p: Product) => void;
}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    fetch("/api/admin/products")
      .then((r) => r.json())
      .then((d) => setProducts(d.products || []))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  if (loading) return <p className="text-galaxy-400 text-sm">Loading...</p>;
  if (products.length === 0) return <p className="text-galaxy-400 text-sm">No products listed yet.</p>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-galaxy-400 border-b border-galaxy-400/20">
            <th className="py-2 pr-4">Product</th>
            <th className="py-2 pr-4">Seller</th>
            <th className="py-2 pr-4">Category</th>
            <th className="py-2 pr-4">Seller Price</th>
            <th className="py-2 pr-4">Admin %</th>
            <th className="py-2 pr-4">Customer Price</th>
            <th className="py-2 pr-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id} className="border-b border-galaxy-400/10">
              <td className="py-3 pr-4 text-white font-medium">
                {p.name}
                <div className="text-xs text-galaxy-500">{p.listing_code}</div>
              </td>
              <td className="py-3 pr-4 text-galaxy-300">{p.seller_name}</td>
              <td className="py-3 pr-4 text-galaxy-300">{p.category_name || "-"}</td>
              <td className="py-3 pr-4 text-galaxy-300">Rs. {parseFloat(p.base_price).toLocaleString()}</td>
              <td className="py-3 pr-4 text-accent">{p.admin_price_adjust_percent || 0}%</td>
              <td className="py-3 pr-4 text-green-400 font-bold">Rs. {parseFloat(p.display_price).toLocaleString()}</td>
              <td className="py-3 pr-4">
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => onAdjust(p)}
                    className="text-xs px-3 py-1 rounded-full bg-accent/20 text-accent hover:bg-accent/30"
                  >
                    Adjust Price
                  </button>
                  <button
                    onClick={() => onPriceRequest(p)}
                    className="text-xs px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
                  >
                    Send Price Request
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
