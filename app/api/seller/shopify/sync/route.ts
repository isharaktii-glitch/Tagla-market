import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { generateListingCode } from "@/lib/codes";

export async function POST() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "seller") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const storeResult = await sql`
      SELECT * FROM external_stores WHERE seller_id = ${user.id} AND platform = 'shopify' AND is_connected = true
    `;
    if (storeResult.length === 0) {
      return NextResponse.json({ error: "No connected Shopify store found" }, { status: 400 });
    }
    const store = storeResult[0];

    const shopifyRes = await fetch(
      `https://${store.store_url}/admin/api/2024-01/products.json?limit=50`,
      { headers: { "X-Shopify-Access-Token": store.access_token } }
    );

    if (!shopifyRes.ok) {
      return NextResponse.json({ error: "Failed to fetch products from Shopify" }, { status: 400 });
    }

    const shopifyData = await shopifyRes.json();
    const shopifyProducts = shopifyData.products || [];

    let imported = 0;
    let updated = 0;

    for (const sp of shopifyProducts) {
      const variant = sp.variants?.[0];
      if (!variant) continue;

      const price = parseFloat(variant.price || "0");
      const shopifyProductId = sp.id.toString();

      const existing = await sql`
        SELECT id FROM products WHERE seller_id = ${user.id} AND external_store_id = ${store.id} AND listing_code LIKE ${"SHOPIFY-" + shopifyProductId + "-%"}
      `;

      const imageUrl = sp.image?.src || null;

      if (existing.length > 0) {
        await sql`
          UPDATE products 
          SET name = ${sp.title}, description = ${sp.body_html || null}, base_price = ${price}, updated_at = now()
          WHERE id = ${existing[0].id}
        `;
        updated++;
      } else {
        const listingCode = `SHOPIFY-${shopifyProductId}-${generateListingCode()}`;
        const result = await sql`
          INSERT INTO products (
            listing_code, seller_id, external_store_id, name, description, base_price,
            stock_qty, is_unlimited_stock, is_commission_based, commission_percent
          )
          VALUES (
            ${listingCode}, ${user.id}, ${store.id}, ${sp.title}, ${sp.body_html || null}, ${price},
            ${variant.inventory_quantity || 0}, false, true, 10
          )
          RETURNING id
        `;
        if (imageUrl) {
          await sql`INSERT INTO product_images (product_id, image_url, sort_order) VALUES (${result[0].id}, ${imageUrl}, 0)`;
        }
        imported++;
      }
    }

    return NextResponse.json({ success: true, imported, updated, total: shopifyProducts.length });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
