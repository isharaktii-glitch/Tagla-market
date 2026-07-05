import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const earnings = await sql`
      SELECT e.*, o.order_code, o.customer_name
      FROM earnings e
      JOIN orders o ON o.id = e.order_id
      WHERE e.reseller_id = ${user.id}
      ORDER BY e.created_at DESC
    `;

    const [totalEarned] = await sql`
      SELECT COALESCE(SUM(amount),0) as sum FROM earnings WHERE reseller_id = ${user.id}
    `;
    const [totalUnpaid] = await sql`
      SELECT COALESCE(SUM(amount),0) as sum FROM earnings WHERE reseller_id = ${user.id} AND status = 'unpaid'
    `;

    return NextResponse.json({
      earnings,
      totalEarned: totalEarned.sum,
      totalUnpaid: totalUnpaid.sum,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
