import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { bank_name, bank_acc_no, bank_acc_name } = await req.json();

    await sql`
      UPDATE users 
      SET bank_name = ${bank_name}, bank_acc_no = ${bank_acc_no}, bank_acc_name = ${bank_acc_name}
      WHERE id = ${user.id}
    `;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
