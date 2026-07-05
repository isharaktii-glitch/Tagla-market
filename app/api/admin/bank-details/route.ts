import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const details = await sql`SELECT * FROM admin_bank_details ORDER BY created_at DESC`;
    return NextResponse.json({ details });
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
    const { bank_name, bank_acc_no, bank_acc_name } = await req.json();

    const result = await sql`
      INSERT INTO admin_bank_details (bank_name, bank_acc_no, bank_acc_name)
      VALUES (${bank_name}, ${bank_acc_no}, ${bank_acc_name})
      RETURNING *
    `;
    return NextResponse.json({ detail: result[0] });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
