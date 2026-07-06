import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "seller") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { store_url, api_key, api_secret, access_token } = await req.json();

    if (!store_url || !access_token) {
      return NextResponse.json({ error: "Store URL and Access Token are required" }, { status: 400 });
    }

    const cleanUrl = store_url.replace(/^https?:\/\//, "").replace(/\/$/, "");

    const testRes = await fetch(`https://${cleanUrl}/admin/api/2024-01/shop.json`, {
      headers: { "X-Shopify-Access-Token": access_token },
    });

    if (!testRes.ok) {
      return NextResponse.json({ error: "Could not connect to Shopify. Check your store URL and access token." }, { status: 400 });
    }

    const existing = await sql`SELECT id FROM external_stores WHERE seller_id = ${user.id} AND platform = 'shopify'`;

    let result;
    if (existing.length > 0) {
      result = await sql`
        UPDATE external_stores 
        SET store_url = ${cleanUrl}, api_key = ${api_key || null}, api_secret = ${api_secret || null},
            access_token = ${access_token}, is_connected = true, connected_at = now()
        WHERE id = ${existing[0].id}
        RETURNING id, store_url, is_connected, connected_at
      `;
    } else {
      result = await sql`
        INSERT INTO external_stores (seller_id, platform, store_url, api_key, api_secret, access_token, is_connected, connected_at)
        VALUES (${user.id}, 'shopify', ${cleanUrl}, ${api_key || null}, ${api_secret || null}, ${access_token}, true, now())
        RETURNING id, store_url, is_connected, connected_at
      `;
    }

    return NextResponse.json({ store: result[0] });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "seller") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await sql`
      SELECT id, store_url, is_connected, connected_at FROM external_stores 
      WHERE seller_id = ${user.id} AND platform = 'shopify'
    `;

    return NextResponse.json({ store: result[0] || null });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
