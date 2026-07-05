import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { generateListingCode } from "@/lib/codes";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "seller") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      name,
      description,
      base_price,
      market_price,
      stock_qty,
      is_unlimited_stock,
      category_id,
      images,
      is_commission_based,
      commission_percent,
    } = await req.json();

    if (!name || !base_price) {
      return NextResponse.json({ error: "Name and price are required" }, { status: 400 });
    }

    const listingCode = generateListingCode();

    const result = await sql`
      INSERT INTO products (
        listing_code, seller_id, category_id, name, description,
        base_price, market_price, stock_qty, is_unlimited_stock,
        is_commission_based, commission_percent
      )
      VALUES (
        ${listingCode}, ${user.id}, ${category_id || null}, ${name}, ${description || null},
        ${base_price}, ${market_price || null}, ${is_unlimited_stock ? null : stock_qty || 0},
        ${!!is_unlimited_stock}, ${is_commission_based !== false}, ${commission_percent || 10}
      )
      RETURNING *
    `;

    const product = result[0];

    if (images && Array.isArray(images) && images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        await sql`
          INSERT INTO product_images (product_id, image_url, sort_order)
          VALUES (${product.id}, ${images[i]}, ${i})
        `;
      }
    }

    return NextResponse.json({ product });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let products;
    if (user.role === "seller") {
      products = await sql`
        SELECT p.*, 
          (SELECT json_agg(image_url ORDER BY sort_order) FROM product_images WHERE product_id = p.id) as images
        FROM products p
        WHERE p.seller_id = ${user.id}
        ORDER BY p.created_at DESC
      `;
    } else {
      // resellers/customers see all active listings, with admin markup applied
      products = await sql`
        SELECT p.*, u.name as seller_name,
          (SELECT json_agg(image_url ORDER BY sort_order) FROM product_images WHERE product_id = p.id) as images,
          ROUND(p.base_price * (1 + COALESCE(p.admin_price_adjust_percent,0)/100), 2) as display_price
        FROM products p
        JOIN users u ON u.id = p.seller_id
        WHERE p.status = 'active'
        ORDER BY p.created_at DESC
      `;
    }

    return NextResponse.json({ products });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
