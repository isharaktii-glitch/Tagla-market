"use client";
import { useState, useEffect } from "react";

export default function BankDetailsForm() {
  const [bankName, setBankName] = useState("");
  const [accNo, setAccNo] = useState("");
  const [accName, setAccName] = useState("");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/users/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.user) {
          setBankName(d.user.bank_name || "");
          setAccNo(d.user.bank_acc_no || "");
          setAccName(d.user.bank_acc_name || "");
        }
      });
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/users/bank-details", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bank_name: bankName, bank_acc_no: accNo, bank_acc_name: accName }),
    });
    setLoading(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <form onSubmit={handleSave} className="glass-card rounded-2xl p-6 space-y-4">
      <h2 className="text-xl font-bold text-white mb-2">🏦 Bank Details</h2>
      <input
        placeholder="Bank name"
        value={bankName}
        onChange={(e) => setBankName(e.target.value)}
        className="w-full px-4 py-3 rounded-lg bg-galaxy-900/60 border border-galaxy-400/30 focus:border-accent outline-none text-white"
      />
      <input
        placeholder="Account number"
        value={accNo}
        onChange={(e) => setAccNo(e.target.value)}
        className="w-full px-4 py-3 rounded-lg bg-galaxy-900/60 border border-galaxy-400/30 focus:border-accent outline-none text-white"
      />
      <input
        placeholder="Account holder name"
        value={accName}
        onChange={(e) => setAccName(e.target.value)}
        className="w-full px-4 py-3 rounded-lg bg-galaxy-900/60 border border-galaxy-400/30 focus:border-accent outline-none text-white"
      />
      <button type="submit" disabled={loading} className="btn-primary w-full py-3 rounded-lg disabled:opacity-50">
        {loading ? "Saving..." : saved ? "✅ Saved!" : "Save Bank Details"}
      </button>
    </form>
  );
}
