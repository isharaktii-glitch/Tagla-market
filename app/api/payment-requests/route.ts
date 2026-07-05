import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { bank_name, bank_acc_no, amount } = await req.json();

    if (!bank_name || !bank_acc_no || !amount) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const result = await sql`
      INSERT INTO payment_requests (requester_id, bank_name, bank_acc_no, amount)
      VALUES (${user.id}, ${bank_name}, ${bank_acc_no}, ${amount})
      RETURNING *
    `;

    return NextResponse.json({ request: result[0] });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let requests;
    if (user.role === "admin") {
      requests = await sql`
        SELECT pr.*, u.name as requester_name, u.email as requester_email
        FROM payment_requests pr
        JOIN users u ON u.id = pr.requester_id
        ORDER BY pr.created_at DESC
      `;
    } else {
      requests = await sql`
        SELECT * FROM payment_requests WHERE requester_id = ${user.id} ORDER BY created_at DESC
      `;
    }

    return NextResponse.json({ requests });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
