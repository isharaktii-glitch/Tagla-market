import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { hashPassword } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { token, newPassword } = await req.json();

    const result = await sql`
      SELECT * FROM password_resets WHERE token = ${token} AND expires_at > now()
    `;
    if (result.length === 0) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
    }

    const reset = result[0];
    const passwordHash = await hashPassword(newPassword);

    await sql`UPDATE users SET password_hash = ${passwordHash} WHERE id = ${reset.user_id}`;
    await sql`DELETE FROM password_resets WHERE id = ${reset.id}`;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
