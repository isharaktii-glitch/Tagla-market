import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orders = await sql`
      SELECT o.*, p.name as product_name, p.listing_code,
        s.name as seller_name, r.name as placed_by_name
      FROM orders o
      JOIN products p ON p.id = o.product_id
      JOIN users s ON s.id = o.seller_id
      JOIN users r ON r.id = o.placed_by_id
      ORDER BY o.created_at DESC
    `;

    return NextResponse.json({ orders });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
