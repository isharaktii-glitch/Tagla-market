import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET() {
  try {
    const details = await sql`
      SELECT id, bank_name, bank_acc_no, bank_acc_name FROM admin_bank_details WHERE is_active = true
    `;
    return NextResponse.json({ details });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
