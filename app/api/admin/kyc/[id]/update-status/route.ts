import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { kyc_status } = await req.json(); // 'not_submitted' | 'pending' | 'verified' | 'rejected'

    const result = await sql`
      UPDATE users SET kyc_status = ${kyc_status} WHERE id = ${params.id}
      RETURNING id, name, kyc_status
    `;

    return NextResponse.json({ user: result[0] });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
