import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sellers = await sql`
      SELECT id, name, email, phone, kyc_status, is_active, created_at,
        (SELECT COUNT(*) FROM products WHERE seller_id = users.id) as product_count
      FROM users WHERE role = 'seller' ORDER BY created_at DESC
    `;

    const resellers = await sql`
      SELECT id, name, email, phone, address, is_active, created_at,
        (SELECT COUNT(*) FROM orders WHERE placed_by_id = users.id) as order_count
      FROM users WHERE role = 'reseller' ORDER BY created_at DESC
    `;

    return NextResponse.json({ sellers, resellers });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
