"use client";
import { useEffect, useState } from "react";

type PaymentRequest = {
  id: string;
  requester_name: string;
  requester_email: string;
  bank_name: string;
  bank_acc_no: string;
  amount: string;
  status: string;
  created_at: string;
};

export default function PaymentRequestsTable() {
  const [requests, setRequests] = useState<PaymentRequest[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    fetch("/api/payment-requests")
      .then((r) => r.json())
      .then((d) => setRequests(d.requests || []))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  async function markDone(id: string) {
    await fetch(`/api/payment-requests/${id}/complete`, { method: "POST" });
    load();
  }

  const filtered = requests.filter(
    (r) =>
      r.requester_name?.toLowerCase().includes(search.toLowerCase()) ||
      r.requester_email?.toLowerCase().includes(search.toLowerCase()) ||
      r.bank_acc_no?.includes(search)
  );

  if (loading) return <p className="text-galaxy-400 text-sm">Loading...</p>;

  return (
    <div>
      <input
        placeholder="🔍 Search by name, email, or account no."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full mb-4 px-4 py-2 rounded-lg bg-galaxy-900/60 border border-galaxy-400/30 focus:border-accent outline-none text-white text-sm"
      />
      {filtered.length === 0 ? (
        <p className="text-galaxy-400 text-sm">No payment requests found.</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => (
            <div key={r.id} className="glass-card rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              <div>
                <p className="text-white font-medium">{r.requester_name}</p>
                <p className="text-xs text-galaxy-400">{r.requester_email}</p>
                <p className="text-xs text-galaxy-500 mt-1">
                  {r.bank_name} • Acc: {r.bank_acc_no}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-accent font-bold">Rs. {parseFloat(r.amount).toLocaleString()}</span>
                <span className={`text-xs px-2 py-1 rounded-full ${r.status === "done" ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"}`}>
                  {r.status}
                </span>
                {r.status === "pending" && (
                  <button
                    onClick={() => markDone(r.id)}
                    className="text-xs px-3 py-1 rounded-full bg-accent/20 text-accent hover:bg-accent/30"
                  >
                    Mark Done
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
