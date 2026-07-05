"use client";
import { useEffect, useState } from "react";

type Seller = {
  id: string;
  name: string;
  email: string;
  kyc_status: string;
  kyc_reference: string | null;
  created_at: string;
};

export default function KycPanel() {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    fetch("/api/admin/kyc")
      .then((r) => r.json())
      .then((d) => setSellers(d.sellers || []))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  async function updateStatus(id: string, status: string) {
    await fetch(`/api/admin/kyc/${id}/update-status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kyc_status: status }),
    });
    load();
  }

  const statusColor: Record<string, string> = {
    not_submitted: "bg-galaxy-700 text-galaxy-400",
    pending: "bg-yellow-500/20 text-yellow-400",
    verified: "bg-green-500/20 text-green-400",
    rejected: "bg-red-500/20 text-red-400",
  };

  if (loading) return <p className="text-galaxy-400 text-sm">Loading...</p>;

  return (
    <div className="space-y-4">
      <div className="glass-card rounded-2xl p-6">
        <h3 className="font-bold text-white mb-2">🪪 KYC Provider Setup</h3>
        <p className="text-sm text-galaxy-400">
          Seller identity verification runs through Sumsub. To activate real ID + face-match
          verification, create a free Sumsub account, create a verification level named{" "}
          <code className="text-accent">basic-kyc-level</code>, then add these two values in
          Vercel → Settings → Environment Variables:
        </p>
        <ul className="text-sm text-galaxy-300 list-disc list-inside mt-2 space-y-1">
          <li><code className="text-accent">SUMSUB_APP_TOKEN</code></li>
          <li><code className="text-accent">SUMSUB_SECRET_KEY</code></li>
        </ul>
        <p className="text-xs text-galaxy-500 mt-2">
          Once added and redeployed, sellers can start verification from their dashboard — no
          code changes needed.
        </p>
      </div>

      <div className="glass-card rounded-2xl p-6">
        <h3 className="font-bold text-white mb-3">Seller KYC Status</h3>
        {sellers.length === 0 ? (
          <p className="text-galaxy-400 text-sm">No sellers yet.</p>
        ) : (
          <div className="space-y-2">
            {sellers.map((s) => (
              <div key={s.id} className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 border-b border-galaxy-400/10 py-3">
                <div>
                  <p className="text-white font-medium">{s.name}</p>
                  <p className="text-xs text-galaxy-400">{s.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${statusColor[s.kyc_status]}`}>
                    {s.kyc_status}
                  </span>
                  {s.kyc_status === "pending" && (
                    <>
                      <button
                        onClick={() => updateStatus(s.id, "verified")}
                        className="text-xs px-3 py-1 rounded-full bg-green-500/20 text-green-400 hover:bg-green-500/30"
                      >
                        Mark Verified
                      </button>
                      <button
                        onClick={() => updateStatus(s.id, "rejected")}
                        className="text-xs px-3 py-1 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/30"
                      >
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
