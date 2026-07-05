"use client";
import { useState } from "react";

export default function PaymentRequestForm() {
  const [bankName, setBankName] = useState("");
  const [accNo, setAccNo] = useState("");
  const [amount, setAmount] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/payment-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bank_name: bankName, bank_acc_no: accNo, amount: parseFloat(amount) }),
    });
    setSaving(false);
    if (res.ok) {
      setMsg("✅ Payment request sent to admin!");
      setBankName(""); setAccNo(""); setAmount("");
    } else {
      setMsg("❌ Failed to send request");
    }
    setTimeout(() => setMsg(""), 3000);
  }

  return (
    <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-6 space-y-3">
      <h3 className="font-bold text-white mb-2">💸 Request Payment</h3>
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
        type="number"
        placeholder="Amount requested"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="w-full px-4 py-3 rounded-lg bg-galaxy-900/60 border border-galaxy-400/30 focus:border-accent outline-none text-white"
      />
      <button type="submit" disabled={saving} className="btn-primary w-full py-3 rounded-lg disabled:opacity-50">
        {saving ? "Sending..." : "Send Request"}
      </button>
      {msg && <p className="text-accent text-sm">{msg}</p>}
    </form>
  );
}
