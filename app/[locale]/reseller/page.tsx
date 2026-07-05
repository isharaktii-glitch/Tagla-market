"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import StarField from "@/components/StarField";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import ProductBrowser from "@/components/reseller/ProductBrowser";
import OrderModal from "@/components/reseller/OrderModal";
import MyOrders from "@/components/reseller/MyOrders";
import EarningsPanel from "@/components/reseller/EarningsPanel";
import PaymentRequestForm from "@/components/reseller/PaymentRequestForm";

type Tab = "browse" | "orders" | "earnings" | "payment";

export default function ResellerDashboard() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;

  const [user, setUser] = useState<any>(null);
  const [tab, setTab] = useState<Tab>("browse");
  const [checking, setChecking] = useState(true);
  const [orderProduct, setOrderProduct] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    fetch("/api/users/me")
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((d) => {
        if (d.user.role !== "reseller" && d.user.role !== "customer") {
          router.push(`/${locale}`);
          return;
        }
        setUser(d.user);
      })
      .catch(() => router.push(`/${locale}/login`))
      .finally(() => setChecking(false));
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push(`/${locale}`);
  }

  function handleOrderPlaced(orderCode: string) {
    setOrderProduct(null);
    setSuccessMsg(`✅ Order placed! Your Order ID: ${orderCode}`);
    setRefreshKey((k) => k + 1);
    setTab("orders");
    setTimeout(() => setSuccessMsg(""), 6000);
  }

  if (checking) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-galaxy-radial text-galaxy-300">
        Loading...
      </main>
    );
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: "browse", label: "🛍️ Browse Products" },
    { key: "orders", label: "🧾 My Orders" },
    { key: "earnings", label: "💰 Earnings" },
    { key: "payment", label: "💸 Request Payment" },
  ];

  return (
    <main className="relative min-h-screen bg-galaxy-radial">
      <StarField />
      <div className="relative z-10">
        <nav className="flex items-center justify-between px-6 py-4 border-b border-galaxy-400/20">
          <div>
            <h1 className="font-bold text-white">🔁 Reseller / Customer Dashboard</h1>
            <p className="text-xs text-galaxy-400">Welcome, {user?.name}</p>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <button onClick={handleLogout} className="text-sm text-galaxy-300 hover:text-white">
              Logout
            </button>
          </div>
        </nav>

        <div className="px-6 py-6">
          {successMsg && (
            <div className="glass-card rounded-xl p-4 mb-4 text-accent text-sm">{successMsg}</div>
          )}

          <div className="flex gap-2 mb-6 flex-wrap">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`px-4 py-2 rounded-full text-sm font-semibold ${tab === t.key ? "bg-accent text-galaxy-950" : "bg-galaxy-800/60 text-galaxy-300"}`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {tab === "browse" && <ProductBrowser onOrder={setOrderProduct} />}
          {tab === "orders" && <MyOrders refreshKey={refreshKey} />}
          {tab === "earnings" && <EarningsPanel />}
          {tab === "payment" && (
            <div className="max-w-md">
              <PaymentRequestForm />
            </div>
          )}
        </div>
      </div>

      {orderProduct && (
        <OrderModal
          product={orderProduct}
          onClose={() => setOrderProduct(null)}
          onPlaced={handleOrderPlaced}
        />
      )}
    </main>
  );
}
