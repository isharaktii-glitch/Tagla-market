"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import StarField from "@/components/StarField";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import StatsCards from "@/components/admin/StatsCards";
import SellersTable from "@/components/admin/SellersTable";
import ResellersTable from "@/components/admin/ResellersTable";
import ProductsTable from "@/components/admin/ProductsTable";
import OrdersTable from "@/components/admin/OrdersTable";
import PriceAdjustModal from "@/components/admin/PriceAdjustModal";
import BulkAdjust from "@/components/admin/BulkAdjust";

type Tab = "overview" | "sellers" | "resellers" | "products" | "orders" | "pricing";

export default function AdminDashboard() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;

  const [user, setUser] = useState<any>(null);
  const [tab, setTab] = useState<Tab>("overview");
  const [checking, setChecking] = useState(true);
  const [adjustProduct, setAdjustProduct] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    fetch("/api/users/me")
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((d) => {
        if (d.user.role !== "admin") {
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

  if (checking) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-galaxy-radial text-galaxy-300">
        Loading...
      </main>
    );
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: "overview", label: "📊 Overview" },
    { key: "sellers", label: "📦 Sellers" },
    { key: "resellers", label: "🔁 Resellers/Customers" },
    { key: "products", label: "🛍️ Products" },
    { key: "orders", label: "🧾 Orders" },
    { key: "pricing", label: "💹 Bulk Pricing" },
  ];

  return (
    <main className="relative min-h-screen bg-galaxy-radial">
      <StarField />
      <div className="relative z-10">
        <nav className="flex items-center justify-between px-6 py-4 border-b border-galaxy-400/20">
          <div>
            <h1 className="font-bold text-white">🛡️ Admin Dashboard</h1>
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

          {tab === "overview" && <StatsCards />}

          {tab === "sellers" && (
            <div className="glass-card rounded-2xl p-6">
              <SellersTable />
            </div>
          )}

          {tab === "resellers" && (
            <div className="glass-card rounded-2xl p-6">
              <ResellersTable />
            </div>
          )}

          {tab === "products" && (
            <div className="glass-card rounded-2xl p-6">
              <ProductsTable key={refreshKey} onAdjust={setAdjustProduct} />
            </div>
          )}

          {tab === "orders" && (
            <div className="glass-card rounded-2xl p-6">
              <OrdersTable />
            </div>
          )}

          {tab === "pricing" && <BulkAdjust />}
        </div>
      </div>

      {adjustProduct && (
        <PriceAdjustModal
          product={adjustProduct}
          onClose={() => setAdjustProduct(null)}
          onSaved={() => setRefreshKey((k) => k + 1)}
        />
      )}
    </main>
  );
}
