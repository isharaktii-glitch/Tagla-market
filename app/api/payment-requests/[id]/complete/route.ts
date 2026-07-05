import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const reqResult = await sql`SELECT * FROM payment_requests WHERE id = ${params.id}`;
    if (reqResult.length === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const paymentReq = reqResult[0];

    await sql`
      UPDATE payment_requests SET status = 'done', paid_at = now() WHERE id = ${params.id}
    `;

    // Deduct from reseller's unpaid earnings (oldest first)
    let remaining = parseFloat(paymentReq.amount);
    const unpaidEarnings = await sql`
      SELECT * FROM earnings WHERE reseller_id = ${paymentReq.requester_id} AND status = 'unpaid' ORDER BY created_at ASC
    `;
    for (const earning of unpaidEarnings) {
      if (remaining <= 0) break;
      const amt = parseFloat(earning.amount);
      if (amt <= remaining) {
        await sql`UPDATE earnings SET status = 'paid' WHERE id = ${earning.id}`;
        remaining -= amt;
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
