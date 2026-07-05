import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    const result = await sql`SELECT id FROM users WHERE email = ${email}`;
    if (result.length === 0) {
      // Don't reveal whether email exists
      return NextResponse.json({ success: true });
    }

    const userId = result[0].id;
    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

    await sql`
      INSERT INTO password_resets (user_id, token, expires_at)
      VALUES (${userId}, ${token}, ${expiresAt.toISOString()})
    `;

    // NOTE: In production, send this link via email (e.g. Resend, SendGrid).
    // For now, we return it directly so you can test the flow.
    const resetLink = `/reset-password?token=${token}`;

    return NextResponse.json({ success: true, resetLink });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
