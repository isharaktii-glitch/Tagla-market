"use client";
import { useState, useEffect } from "react";

type Detail = { id: string; bank_name: string; bank_acc_no: string; bank_acc_name: string };

export default function AdminBankDetails() {
  const [details, setDetails] = useState<Detail[]>([]);
  const [bankName, setBankName] = useState("");
  const [accNo, setAccNo] = useState("");
  const [accName, setAccName] = useState("");
  const [saving, setSaving] = useState(false);

  function load() {
    fetch("/api/admin/bank-details")
      .then((r) => r.json())
      .then((d) => setDetails(d.details || []));
  }

  useEffect(() => { load(); }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/admin/bank-details", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bank_name: bankName, bank_acc_no: accNo, bank_acc_name: accName }),
    });
    setSaving(false);
    setBankName(""); setAccNo(""); setAccName("");
    load();
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleAdd} className="glass-card rounded-2xl p-6 space-y-3">
        <h3 className="font-bold text-white mb-2">🏦 Add Payment Bank Account</h3>
        <p className="text-xs text-galaxy-400 mb-2">
          This account will be shown to customers when they need to pay for direct orders.
        </p>
        <input
          required
          placeholder="Bank name"
          value={bankName}
          onChange={(e) => setBankName(e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-galaxy-900/60 border border-galaxy-400/30 focus:border-accent outline-none text-white"
        />
        <input
          required
          placeholder="Account number"
          value={accNo}
          onChange={(e) => setAccNo(e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-galaxy-900/60 border border-galaxy-400/30 focus:border-accent outline-none text-white"
        />
        <input
          required
          placeholder="Account holder name"
          value={accName}
          onChange={(e) => setAccName(e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-galaxy-900/60 border border-galaxy-400/30 focus:border-accent outline-none text-white"
        />
        <button type="submit" disabled={saving} className="btn-primary w-full py-3 rounded-lg disabled:opacity-50">
          {saving ? "Saving..." : "Add Bank Account"}
        </button>
      </form>

      <div className="glass-card rounded-2xl p-6">
        <h3 className="font-bold text-white mb-3">Current Accounts</h3>
        {details.length === 0 ? (
          <p className="text-galaxy-400 text-sm">No bank accounts added yet.</p>
        ) : (
          <div className="space-y-2">
            {details.map((d) => (
              <div key={d.id} className="text-sm border-b border-galaxy-400/10 py-2">
                <p className="text-white">{d.bank_name}</p>
                <p className="text-galaxy-400 text-xs">{d.bank_acc_name} • {d.bank_acc_no}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
