"use client";
import { useEffect, useState } from "react";

type Reseller = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  order_count: string;
  created_at: string;
};

export default function ResellersTable() {
  const [resellers, setResellers] = useState<Reseller[]>([]);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((d) => setResellers(d.resellers || []))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    load();
  }

  if (loading) return <p className="text-galaxy-400 text-sm">Loading...</p>;
  if (resellers.length === 0) return <p className="text-galaxy-400 text-sm">No resellers/customers registered yet.</p>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-galaxy-400 border-b border-galaxy-400/20">
            <th className="py-2 pr-4">Name</th>
            <th className="py-2 pr-4">Email</th>
            <th className="py-2 pr-4">Phone</th>
            <th className="py-2 pr-4">Orders</th>
            <th className="py-2 pr-4">Joined</th>
            <th className="py-2 pr-4">Action</th>
          </tr>
        </thead>
        <tbody>
          {resellers.map((r) => (
            <tr key={r.id} className="border-b border-galaxy-400/10">
              <td className="py-3 pr-4 text-white font-medium">{r.name}</td>
              <td className="py-3 pr-4 text-galaxy-300">{r.email}</td>
              <td className="py-3 pr-4 text-galaxy-300">{r.phone || "-"}</td>
              <td className="py-3 pr-4 text-accent">{r.order_count}</td>
              <td className="py-3 pr-4 text-galaxy-500 text-xs">
                {new Date(r.created_at).toLocaleDateString()}
              </td>
              <td className="py-3 pr-4">
                <button
                  onClick={() => handleDelete(r.id, r.name)}
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
