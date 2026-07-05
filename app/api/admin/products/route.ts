import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const products = await sql`
      SELECT p.*, u.name as seller_name, u.email as seller_email,
        c.name_en as category_name,
        (SELECT json_agg(image_url ORDER BY sort_order) FROM product_images WHERE product_id = p.id) as images,
        ROUND(p.base_price * (1 + COALESCE(p.admin_price_adjust_percent,0)/100), 2) as display_price
      FROM products p
      JOIN users u ON u.id = p.seller_id
      LEFT JOIN categories c ON c.id = p.category_id
      ORDER BY p.created_at DESC
    `;

    return NextResponse.json({ products });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
