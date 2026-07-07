import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

export async function GET() {
  try {
    const user = await getCurrentUser();
    // Admin sees all categories (including hidden), everyone else sees only visible ones
    if (user && user.role === "admin") {
      const categories = await sql`SELECT * FROM categories ORDER BY name_en ASC`;
      return NextResponse.json({ categories });
    }
    const categories = await sql`SELECT * FROM categories WHERE is_hidden = false ORDER BY name_en ASC`;
    return NextResponse.json({ categories });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
