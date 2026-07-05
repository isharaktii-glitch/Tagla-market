"use client";
import { useEffect, useState } from "react";

type Earning = {
  id: string;
  order_code: string;
  customer_name: string;
  amount: string;
  status: string;
  created_at: string;
};

export default function EarningsPanel() {
  const [earnings, setEarnings] = useState<Earning[]>([]);
  const [totalEarned, setTotalEarned] = useState("0");
  const [totalUnpaid, setTotalUnpaid] = useState("0");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/earnings")
      .then((r) => r.json())
      .then((d) => {
        setEarnings(d.earnings || []);
        setTotalEarned(d.totalEarned || "0");
        setTotalUnpaid(d.totalUnpaid || "0");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-galaxy-400 text-sm">Loading earnings...</p>;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="glass-card rounded-xl p-4">
          <p className="text-xs text-galaxy-400">Total Earned</p>
          <p className="text-xl font-bold text-white">Rs. {parseFloat(totalEarned).toLocaleString()}</p>
        </div>
        <div className="glass-card rounded-xl p-4">
          <p className="text-xs text-galaxy-400">Unpaid Balance</p>
          <p className="text-xl font-bold text-accent">Rs. {parseFloat(totalUnpaid).toLocaleString()}</p>
        </div>
      </div>

      <div className="glass-card rounded-2xl p-4">
        <h3 className="font-bold text-white mb-3">Earnings History</h3>
        {earnings.length === 0 ? (
          <p className="text-galaxy-400 text-sm">No earnings yet.</p>
        ) : (
          <div className="space-y-2">
            {earnings.map((e) => (
              <div key={e.id} className="flex justify-between items-center text-sm border-b border-galaxy-400/10 py-2">
                <div>
                  <p className="text-white">{e.order_code}</p>
                  <p className="text-xs text-galaxy-500">{e.customer_name}</p>
                </div>
                <div className="text-right">
                  <p className="text-accent font-bold">Rs. {parseFloat(e.amount).toLocaleString()}</p>
                  <span className={`text-xs ${e.status === "paid" ? "text-green-400" : "text-yellow-400"}`}>
                    {e.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
