import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [sellerCount] = await sql`SELECT COUNT(*) FROM users WHERE role = 'seller'`;
    const [resellerCount] = await sql`SELECT COUNT(*) FROM users WHERE role = 'reseller'`;
    const [productCount] = await sql`SELECT COUNT(*) FROM products`;
    const [orderCount] = await sql`SELECT COUNT(*) FROM orders`;
    const [pendingOrders] = await sql`SELECT COUNT(*) FROM orders WHERE delivery_status = 'pending'`;
    const [totalSales] = await sql`SELECT COALESCE(SUM(total_price),0) as sum FROM orders`;

    return NextResponse.json({
      sellerCount: sellerCount.count,
      resellerCount: resellerCount.count,
      productCount: productCount.count,
      orderCount: orderCount.count,
      pendingOrders: pendingOrders.count,
      totalSales: totalSales.sum,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
