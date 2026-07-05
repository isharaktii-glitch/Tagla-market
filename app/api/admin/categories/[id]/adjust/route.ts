import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { percent } = await req.json();

    await sql`UPDATE categories SET price_adjust_percent = ${percent} WHERE id = ${params.id}`;
    await sql`UPDATE products SET admin_price_adjust_percent = ${percent}, updated_at = now() WHERE category_id = ${params.id}`;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
