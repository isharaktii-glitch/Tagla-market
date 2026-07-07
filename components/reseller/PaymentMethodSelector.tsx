"use client";
import { useState, useEffect } from "react";

type AdminBank = { id: string; bank_name: string; bank_acc_no: string; bank_acc_name: string };

export default function PaymentMethodSelector({
  value,
  onChange,
}: {
  value: string;
  onChange: (method: string) => void;
}) {
  const [adminBanks, setAdminBanks] = useState<AdminBank[]>([]);

  useEffect(() => {
    fetch("/api/admin-bank-public")
      .then((r) => r.json())
      .then((d) => setAdminBanks(d.details || []));
  }, []);

  return (
    <div className="space-y-2">
      <label className="text-sm text-galaxy-300">Payment Method</label>
      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={() => onChange("cod")}
          className={`py-2 rounded-lg text-xs font-semibold ${value === "cod" ? "bg-accent text-galaxy-950" : "bg-galaxy-800/60 text-galaxy-300"}`}
        >
          💵 Cash on Delivery
        </button>
        <button
          type="button"
          onClick={() => onChange("bank_transfer")}
          className={`py-2 rounded-lg text-xs font-semibold ${value === "bank_transfer" ? "bg-accent text-galaxy-950" : "bg-galaxy-800/60 text-galaxy-300"}`}
        >
          🏦 Bank Transfer
        </button>
        <button
          type="button"
          onClick={() => onChange("payhere")}
          className={`py-2 rounded-lg text-xs font-semibold ${value === "payhere" ? "bg-accent text-galaxy-950" : "bg-galaxy-800/60 text-galaxy-300"}`}
        >
          💳 Card (PayHere)
        </button>
      </div>

      {value === "bank_transfer" && adminBanks.length > 0 && (
        <div className="bg-galaxy-900/60 rounded-lg p-3 text-xs text-galaxy-300 space-y-1">
          <p className="text-accent font-semibold mb-1">Transfer to:</p>
          {adminBanks.map((b) => (
            <div key={b.id}>
              <p>{b.bank_name} — {b.bank_acc_name}</p>
              <p>Acc No: {b.bank_acc_no}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
