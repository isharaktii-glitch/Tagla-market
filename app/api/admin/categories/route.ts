import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const categories = await sql`SELECT * FROM categories ORDER BY name_en ASC`;
    return NextResponse.json({ categories });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { name_en, name_si, name_ta } = await req.json();
    if (!name_en) {
      return NextResponse.json({ error: "English name is required" }, { status: 400 });
    }
    const result = await sql`
      INSERT INTO categories (name_en, name_si, name_ta)
      VALUES (${name_en}, ${name_si || null}, ${name_ta || null})
      RETURNING *
    `;
    return NextResponse.json({ category: result[0] });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
