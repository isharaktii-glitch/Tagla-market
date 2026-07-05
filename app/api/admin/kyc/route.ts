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
      SELECT id, name, email, kyc_status, kyc_reference, created_at
      FROM users WHERE role = 'seller' ORDER BY created_at DESC
    `;

    return NextResponse.json({ sellers });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
