import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const merchant_id = formData.get("merchant_id")?.toString() || "";
    const order_id = formData.get("order_id")?.toString() || "";
    const payhere_amount = formData.get("payhere_amount")?.toString() || "";
    const payhere_currency = formData.get("payhere_currency")?.toString() || "";
    const status_code = formData.get("status_code")?.toString() || "";
    const md5sig = formData.get("md5sig")?.toString() || "";
    const payment_id = formData.get("payment_id")?.toString() || "";

    const MERCHANT_SECRET = process.env.PAYHERE_MERCHANT_SECRET!;
    const secretHash = crypto.createHash("md5").update(MERCHANT_SECRET).digest("hex").toUpperCase();
    const localSig = crypto
      .createHash("md5")
      .update(merchant_id + order_id + payhere_amount + payhere_currency + status_code + secretHash)
      .digest("hex")
      .toUpperCase();

    if (localSig !== md5sig) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    if (status_code === "2") {
      // Payment success
      await sql`
        UPDATE orders 
        SET payment_status = 'paid', payhere_payment_id = ${payment_id}
        WHERE payhere_order_id = ${order_id}
      `;
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
