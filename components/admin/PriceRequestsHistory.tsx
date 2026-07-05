"use client";
import { useEffect, useState } from "react";

type Req = {
  id: string;
  product_name: string;
  listing_code: string;
  seller_name: string;
  requested_percent: string;
  current_price: string;
  proposed_price: string;
  seller_counter_price: string | null;
  status: string;
  created_at: string;
};

export default function PriceRequestsHistory() {
  const [requests, setRequests] = useState<Req[]>([]);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    fetch("/api/price-requests")
      .then((r) => r.json())
      .then((d) => setRequests(d.requests || []))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  async function respondToCounter(id: string, accept: boolean) {
    await fetch(`/api/price-requests/${id}/admin-respond`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accept_counter: accept }),
    });
    load();
  }

  if (loading) return <p className="text-galaxy-400 text-sm">Loading...</p>;
  if (requests.length === 0) return <p className="text-galaxy-400 text-sm">No price requests sent yet.</p>;

  const statusColor: Record<string, string> = {
    pending: "bg-yellow-500/20 text-yellow-400",
    accepted: "bg-green-500/20 text-green-400",
    rejected: "bg-red-500/20 text-red-400",
    countered: "bg-blue-500/20 text-blue-400",
  };

  return (
    <div className="space-y-3">
      {requests.map((r) => (
        <div key={r.id} className="glass-card rounded-xl p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div>
              <p className="text-white font-medium">{r.product_name}</p>
              <p className="text-xs text-galaxy-400">Seller: {r.seller_name} • {r.requested_percent}% change</p>
              <p className="text-xs text-galaxy-500">
                Rs. {parseFloat(r.current_price).toLocaleString()} → Rs. {parseFloat(r.proposed_price).toLocaleString()}
              </p>
            </div>
            <span className={`text-xs px-2 py-1 rounded-full ${statusColor[r.status]}`}>{r.status}</span>
          </div>

          {r.status === "countered" && r.seller_counter_price && (
            <div className="mt-3 bg-galaxy-900/60 rounded-lg p-3">
              <p className="text-sm text-galaxy-300 mb-2">
                Seller counter-offered: <span className="text-accent font-bold">Rs. {parseFloat(r.seller_counter_price).toLocaleString()}</span>
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => respondToCounter(r.id, true)}
                  className="text-xs px-3 py-1 rounded-full bg-green-500/20 text-green-400 hover:bg-green-500/30"
                >
                  Accept Counter
                </button>
                <button
                  onClick={() => respondToCounter(r.id, false)}
                  className="text-xs px-3 py-1 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/30"
                >
                  Reject
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
