"use client";
import { useState, useEffect } from "react";

export default function KycVerification() {
  const [status, setStatus] = useState<string>("not_submitted");
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/users/me")
      .then((r) => r.json())
      .then((d) => setStatus(d.user?.kyc_status || "not_submitted"));
  }, []);

  async function startVerification() {
    setStarting(true);
    setError("");
    const res = await fetch("/api/kyc/generate-link", { method: "POST" });
    const data = await res.json();
    setStarting(false);
    if (!res.ok) {
      setError(data.error || "Could not start verification");
      return;
    }
    // In a full integration, you'd load the Sumsub WebSDK here with data.token
    // and open their verification widget. For now we confirm the session started.
    setStatus("pending");
  }

  const statusColor: Record<string, string> = {
    not_submitted: "bg-galaxy-700 text-galaxy-400",
    pending: "bg-yellow-500/20 text-yellow-400",
    verified: "bg-green-500/20 text-green-400",
    rejected: "bg-red-500/20 text-red-400",
  };

  return (
    <div className="glass-card rounded-2xl p-6 max-w-md">
      <h3 className="font-bold text-white mb-2">🪪 KYC Verification</h3>
      <p className="text-sm text-galaxy-400 mb-4">
        Verify your identity to list products without manual admin approval.
      </p>
      <span className={`text-xs px-3 py-1 rounded-full ${statusColor[status]}`}>
        {status.replace("_", " ")}
      </span>

      {status !== "verified" && status !== "pending" && (
        <button
          onClick={startVerification}
          disabled={starting}
          className="btn-primary w-full mt-4 py-3 rounded-lg disabled:opacity-50"
        >
          {starting ? "Starting..." : "Start Verification"}
        </button>
      )}
      {status === "pending" && (
        <p className="text-xs text-galaxy-400 mt-3">
          Your verification is being reviewed. This may take a few minutes.
        </p>
      )}
      {error && <p className="text-red-400 text-sm mt-3">{error}</p>}
    </div>
  );
}
