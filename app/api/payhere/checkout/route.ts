import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { sql } from "@/lib/db";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { order_id } = await req.json();

    const orderResult = await sql`SELECT * FROM orders WHERE id = ${order_id}`;
    if (orderResult.length === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    const order = orderResult[0];

    const MERCHANT_ID = process.env.PAYHERE_MERCHANT_ID;
    const MERCHANT_SECRET = process.env.PAYHERE_MERCHANT_SECRET;

    if (!MERCHANT_ID || !MERCHANT_SECRET) {
      return NextResponse.json(
        { error: "PayHere not configured yet. Add PAYHERE_MERCHANT_ID and PAYHERE_MERCHANT_SECRET in Vercel." },
        { status: 503 }
      );
    }

    const amount = parseFloat(order.total_price).toFixed(2);
    const currency = "LKR";

    // PayHere hash = MD5(merchant_id + order_id + amount + currency + MD5(merchant_secret))
    const secretHash = crypto.createHash("md5").update(MERCHANT_SECRET).digest("hex").toUpperCase();
    const hash = crypto
      .createHash("md5")
      .update(MERCHANT_ID + order.order_code + amount + currency + secretHash)
      .digest("hex")
      .toUpperCase();

    await sql`UPDATE orders SET payhere_order_id = ${order.order_code} WHERE id = ${order_id}`;

    return NextResponse.json({
      merchant_id: MERCHANT_ID,
      order_id: order.order_code,
      amount,
      currency,
      hash,
      customer_name: order.customer_name,
      customer_contact: order.customer_contact,
      customer_address: order.customer_address || "",
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
