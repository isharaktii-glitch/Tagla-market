"use client";
import { useState, useEffect } from "react";

type Store = { id: string; store_url: string; is_connected: boolean; connected_at: string } | null;

export default function ShopifyConnect() {
  const [store, setStore] = useState<Store>(null);
  const [storeUrl, setStoreUrl] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);

  function load() {
    fetch("/api/seller/shopify/connect")
      .then((r) => r.json())
      .then((d) => setStore(d.store))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  async function handleConnect(e: React.FormEvent) {
    e.preventDefault();
    setConnecting(true);
    setMsg("");
    const res = await fetch("/api/seller/shopify/connect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ store_url: storeUrl, access_token: accessToken, api_key: apiKey, api_secret: apiSecret }),
    });
    const data = await res.json();
    setConnecting(false);
    if (!res.ok) {
      setMsg(`❌ ${data.error}`);
      return;
    }
    setMsg("✅ Connected successfully!");
    load();
  }

  async function handleSync() {
    setSyncing(true);
    setMsg("");
    const res = await fetch("/api/seller/shopify/sync", { method: "POST" });
    const data = await res.json();
    setSyncing(false);
    if (!res.ok) {
      setMsg(`❌ ${data.error}`);
      return;
    }
    setMsg(`✅ Synced! ${data.imported} new, ${data.updated} updated (of ${data.total} products)`);
  }

  if (loading) return <p className="text-galaxy-400 text-sm">Loading...</p>;

  return (
    <div className="space-y-4">
      {store?.is_connected ? (
        <div className="glass-card rounded-2xl p-6">
          <h3 className="font-bold text-white mb-2">🔗 Shopify Store Connected</h3>
          <p className="text-sm text-galaxy-300">{store.store_url}</p>
          <p className="text-xs text-galaxy-500 mb-4">
            Connected: {new Date(store.connected_at).toLocaleString()}
          </p>
          <button onClick={handleSync} disabled={syncing} className="btn-primary px-5 py-2 rounded-lg text-sm disabled:opacity-50">
            {syncing ? "Syncing..." : "🔄 Sync Products Now"}
          </button>
          {msg && <p className="text-accent text-sm mt-3">{msg}</p>}
        </div>
      ) : (
        <form onSubmit={handleConnect} className="glass-card rounded-2xl p-6 space-y-3">
          <h3 className="font-bold text-white mb-2">🔗 Connect Your Shopify Store</h3>
          <p className="text-xs text-galaxy-400 mb-3">
            In Shopify Admin → Settings → Apps → Develop apps → Create a custom app, then
            enable Admin API access with <code className="text-accent">read_products</code> scope,
            and copy the Admin API access token here.
          </p>
          <input
            required
            placeholder="Store URL (e.g. yourstore.myshopify.com)"
            value={storeUrl}
            onChange={(e) => setStoreUrl(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-galaxy-900/60 border border-galaxy-400/30 focus:border-accent outline-none text-white text-sm"
          />
          <input
            required
            placeholder="Admin API Access Token"
            value={accessToken}
            onChange={(e) => setAccessToken(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-galaxy-900/60 border border-galaxy-400/30 focus:border-accent outline-none text-white text-sm"
          />
          <input
            placeholder="API Key (optional)"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-galaxy-900/60 border border-galaxy-400/30 focus:border-accent outline-none text-white text-sm"
          />
          <input
            placeholder="API Secret (optional)"
            value={apiSecret}
            onChange={(e) => setApiSecret(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-galaxy-900/60 border border-galaxy-400/30 focus:border-accent outline-none text-white text-sm"
          />
          {msg && <p className="text-sm">{msg}</p>}
          <button type="submit" disabled={connecting} className="btn-primary w-full py-3 rounded-lg disabled:opacity-50">
            {connecting ? "Connecting..." : "Connect Store"}
          </button>
        </form>
      )}
    </div>
  );
}
