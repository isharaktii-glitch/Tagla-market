"use client";
import { useEffect, useState } from "react";

type Req = {
  id: string;
  product_name: string;
  listing_code: string;
  requested_percent: string;
  current_price: string;
  proposed_price: string;
  status: string;
  created_at: string;
};

export default function PriceRequestsPanel() {
  const [requests, setRequests] = useState<Req[]>([]);
  const [loading, setLoading] = useState(true);
  const [counterInputs, setCounterInputs] = useState<Record<string, string>>({});

  function load() {
    setLoading(true);
    fetch("/api/price-requests")
      .then((r) => r.json())
      .then((d) => setRequests(d.requests || []))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  async function respond(id: string, action: "accept" | "reject" | "counter") {
    const body: any = { action };
    if (action === "counter") {
      body.counter_price = parseFloat(counterInputs[id] || "0");
    }
    await fetch(`/api/price-requests/${id}/respond`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    load();
  }

  if (loading) return <p className="text-galaxy-400 text-sm">Loading...</p>;

  const pending = requests.filter((r) => r.status === "pending");
  const others = requests.filter((r) => r.status !== "pending");

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-bold text-white mb-3">📩 Pending Requests from Admin</h3>
        {pending.length === 0 ? (
          <p className="text-galaxy-400 text-sm">No pending price requests.</p>
        ) : (
          <div className="space-y-3">
            {pending.map((r) => (
              <div key={r.id} className="glass-card rounded-xl p-4">
                <p className="text-white font-medium">{r.product_name}</p>
                <p className="text-xs text-galaxy-400 mb-2">{r.listing_code}</p>
                <div className="bg-galaxy-900/60 rounded-lg p-3 text-sm mb-3">
                  <div className="flex justify-between text-galaxy-300">
                    <span>Current price</span>
                    <span>Rs. {parseFloat(r.current_price).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-white font-bold mt-1">
                    <span>Admin proposes ({r.requested_percent}%)</span>
                    <span className="text-accent">Rs. {parseFloat(r.proposed_price).toLocaleString()}</span>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => respond(r.id, "accept")}
                    className="text-xs px-3 py-2 rounded-full bg-green-500/20 text-green-400 hover:bg-green-500/30"
                  >
                    ✅ Accept
                  </button>
                  <button
                    onClick={() => respond(r.id, "reject")}
                    className="text-xs px-3 py-2 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/30"
                  >
                    ❌ Reject
                  </button>
                  <input
                    type="number"
                    placeholder="Counter price"
                    value={counterInputs[r.id] || ""}
                    onChange={(e) => setCounterInputs({ ...counterInputs, [r.id]: e.target.value })}
                    className="w-32 px-3 py-2 rounded-lg bg-galaxy-900/60 border border-galaxy-400/30 text-white text-xs"
                  />
                  <button
                    onClick={() => respond(r.id, "counter")}
                    className="text-xs px-3 py-2 rounded-full bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
                  >
                    Send Counter
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {others.length > 0 && (
        <div>
          <h3 className="font-bold text-white mb-3">History</h3>
          <div className="space-y-2">
            {others.map((r) => (
              <div key={r.id} className="flex justify-between items-center text-sm border-b border-galaxy-400/10 py-2">
                <span className="text-galaxy-300">{r.product_name}</span>
                <span className="text-galaxy-500">{r.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
