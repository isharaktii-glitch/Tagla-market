"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Script from "next/script";
import StarField from "@/components/StarField";

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  const orderId = params.orderId as string;

  const [payhereData, setPayhereData] = useState<any>(null);
  const [error, setError] = useState("");
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/payhere/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order_id: orderId }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.error) {
          setError(d.error);
          return;
        }
        setPayhereData(d);
      });
  }, [orderId]);

  useEffect(() => {
    if (payhereData && scriptLoaded && (window as any).payhere) {
      const payhere = (window as any).payhere;

      payhere.onCompleted = function () {
        router.push(`/${locale}/reseller?payment=success`);
      };
      payhere.onDismissed = function () {
        setError("Payment was cancelled.");
      };
      payhere.onError = function (error: string) {
        setError("Payment error: " + error);
      };

      const payment = {
        sandbox: true, // ⚠️ set to false for real/live payments
        merchant_id: payhereData.merchant_id,
        return_url: undefined,
        cancel_url: undefined,
        notify_url: `${window.location.origin}/api/payhere/notify`,
        order_id: payhereData.order_id,
        items: "Tagla Market Order",
        amount: payhereData.amount,
        currency: payhereData.currency,
        hash: payhereData.hash,
        first_name: payhereData.customer_name,
        last_name: "",
        email: "customer@taglamarket.com",
        phone: payhereData.customer_contact,
        address: payhereData.customer_address,
        city: "Colombo",
        country: "Sri Lanka",
      };

      payhere.startPayment(payment);
    }
  }, [payhereData, scriptLoaded]);

  return (
    <main className="relative min-h-screen flex items-center justify-center bg-galaxy-radial px-4">
      <StarField />
      <Script
        src="https://www.payhere.lk/lib/payhere.js"
        onLoad={() => setScriptLoaded(true)}
      />
      <div className="relative z-10 glass-card rounded-2xl p-8 max-w-md w-full text-center">
        {error ? (
          <>
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={() => router.push(`/${locale}/reseller`)}
              className="btn-primary px-6 py-2 rounded-lg text-sm"
            >
              Back to Dashboard
            </button>
          </>
        ) : (
          <p className="text-galaxy-300">Redirecting to secure payment...</p>
        )}
      </div>
    </main>
  );
}
