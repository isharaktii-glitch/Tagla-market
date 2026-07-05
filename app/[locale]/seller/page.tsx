"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import StarField from "@/components/StarField";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import ProductForm from "@/components/seller/ProductForm";
import ProductList from "@/components/seller/ProductList";
import BankDetailsForm from "@/components/seller/BankDetailsForm";

export default function SellerDashboard() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;

  const [user, setUser] = useState<any>(null);
  const [tab, setTab] = useState<"listings" | "bank">("listings");
  const [refreshKey, setRefreshKey] = useState(0);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    fetch("/api/users/me")
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((d) => {
        if (d.user.role !== "seller") {
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

  return (
    <main className="relative min-h-screen bg-galaxy-radial">
      <StarField />
      <div className="relative z-10">
        <nav className="flex items-center justify-between px-6 py-4 border-b border-galaxy-400/20">
          <div>
            <h1 className="font-bold text-white">📦 Seller Dashboard</h1>
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
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setTab("listings")}
              className={`px-4 py-2 rounded-full text-sm font-semibold ${tab === "listings" ? "bg-accent text-galaxy-950" : "bg-galaxy-800/60 text-galaxy-300"}`}
            >
              My Listings
            </button>
            <button
              onClick={() => setTab("orders")}
              className={`px-4 py-2 rounded-full text-sm font-semibold ${tab === "orders" ? "bg-accent text-galaxy-950" : "bg-galaxy-800/60 text-galaxy-300"}`}
            >
              My Orders
            </button>
            <button
              onClick={() => setTab("bank")}
              className={`px-4 py-2 rounded-full text-sm font-semibold ${tab === "bank" ? "bg-accent text-galaxy-950" : "bg-galaxy-800/60 text-galaxy-300"}`}
            >
              Bank Details
            </button>
          </div>

          {tab === "listings" && (
            <div className="space-y-6 max-w-5xl">
              <ProductForm onCreated={() => setRefreshKey((k) => k + 1)} />
              <ProductList refreshKey={refreshKey} />
            </div>
          )}

          {tab === "bank" && ( {tab === "orders" && (
            <div className="max-w-5xl">
              <SellerOrders />
            </div>
          )}
            <div className="max-w-md">
              <BankDetailsForm />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
