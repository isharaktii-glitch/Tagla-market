"use client";
import { useEffect, useState } from "react";

type Seller = {
  id: string;
  name: string;
  email: string;
  phone: string;
  kyc_status: string;
  is_active: boolean;
  product_count: string;
  created_at: string;
};

export default function SellersTable() {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((d) => setSellers(d.sellers || []))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete seller "${name}"? This will also delete all their products and cannot be undone.`)) return;
    await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    load();
  }

  if (loading) return <p className="text-galaxy-400 text-sm">Loading...</p>;
  if (sellers.length === 0) return <p className="text-galaxy-400 text-sm">No sellers registered yet.</p>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-galaxy-400 border-b border-galaxy-400/20">
            <th className="py-2 pr-4">Name</th>
            <th className="py-2 pr-4">Email</th>
            <th className="py-2 pr-4">Phone</th>
            <th className="py-2 pr-4">Products</th>
            <th className="py-2 pr-4">KYC</th>
            <th className="py-2 pr-4">Joined</th>
            <th className="py-2 pr-4">Action</th>
          </tr>
        </thead>
        <tbody>
          {sellers.map((s) => (
            <tr key={s.id} className="border-b border-galaxy-400/10">
              <td className="py-3 pr-4 text-white font-medium">{s.name}</td>
              <td className="py-3 pr-4 text-galaxy-300">{s.email}</td>
              <td className="py-3 pr-4 text-galaxy-300">{s.phone || "-"}</td>
              <td className="py-3 pr-4 text-accent">{s.product_count}</td>
              <td className="py-3 pr-4">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  s.kyc_status === "verified" ? "bg-green-500/20 text-green-400" :
                  s.kyc_status === "pending" ? "bg-yellow-500/20 text-yellow-400" :
                  "bg-galaxy-700 text-galaxy-400"
                }`}>
                  {s.kyc_status}
                </span>
              </td>
              <td className="py-3 pr-4 text-galaxy-500 text-xs">
                {new Date(s.created_at).toLocaleDateString()}
              </td>
              <td className="py-3 pr-4">
                <button
                  onClick={() => handleDelete(s.id, s.name)}
                  className="text-xs px-3 py-1 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/30"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
