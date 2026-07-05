import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { generateOrderCode } from "@/lib/codes";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "reseller" && user.role !== "customer")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      product_id,
      customer_name,
      customer_contact,
      customer_address,
      customer_location_lat,
      customer_location_lng,
      quantity,
      reseller_margin_percent,
      is_reseller_mode,
    } = await req.json();

    if (!product_id || !customer_name || !customer_contact) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const productResult = await sql`SELECT * FROM products WHERE id = ${product_id}`;
    if (productResult.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    const product = productResult[0];

    const adminAdjusted = parseFloat(product.base_price) * (1 + parseFloat(product.admin_price_adjust_percent || 0) / 100);
    const margin = is_reseller_mode ? parseFloat(reseller_margin_percent || 0) : 0;
    const unitPrice = adminAdjusted * (1 + margin / 100);
    const qty = quantity || 1;
    const totalPrice = unitPrice * qty;

    const commissionAmount = is_reseller_mode && product.is_commission_based
      ? (adminAdjusted * qty) * (parseFloat(product.commission_percent) / 100)
      : 0;

    const orderCode = generateOrderCode();

    const result = await sql`
      INSERT INTO orders (
        order_code, product_id, seller_id, placed_by_id, placed_by_role,
        customer_name, customer_contact, customer_address,
        customer_location_lat, customer_location_lng,
        quantity, unit_price, total_price, reseller_margin_percent, commission_amount
      )
      VALUES (
        ${orderCode}, ${product_id}, ${product.seller_id}, ${user.id}, ${user.role},
        ${customer_name}, ${customer_contact}, ${customer_address || null},
        ${customer_location_lat || null}, ${customer_location_lng || null},
        ${qty}, ${unitPrice.toFixed(2)}, ${totalPrice.toFixed(2)}, ${margin}, ${commissionAmount.toFixed(2)}
      )
      RETURNING *
    `;

    const order = result[0];

    if (is_reseller_mode && commissionAmount > 0) {
      await sql`
        INSERT INTO earnings (reseller_id, order_id, amount)
        VALUES (${user.id}, ${order.id}, ${commissionAmount.toFixed(2)})
      `;
    }

    return NextResponse.json({ order });
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

    let orders;
    if (user.role === "seller") {
      orders = await sql`
        SELECT o.*, p.name as product_name, p.listing_code, r.name as placed_by_name
        FROM orders o
        JOIN products p ON p.id = o.product_id
        JOIN users r ON r.id = o.placed_by_id
        WHERE o.seller_id = ${user.id}
        ORDER BY o.created_at DESC
      `;
    } else if (user.role === "reseller" || user.role === "customer") {
      orders = await sql`
        SELECT o.*, p.name as product_name, p.listing_code, s.name as seller_name
        FROM orders o
        JOIN products p ON p.id = o.product_id
        JOIN users s ON s.id = o.seller_id
        WHERE o.placed_by_id = ${user.id}
        ORDER BY o.created_at DESC
      `;
    } else {
      orders = [];
    }

    return NextResponse.json({ orders });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
