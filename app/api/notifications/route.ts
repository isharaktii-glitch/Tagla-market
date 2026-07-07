import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const notifications = await sql`
      SELECT ar.id as read_id, ar.is_read, ar.is_pinned, ar.created_at as received_at,
        a.id as announcement_id, a.title, a.message, a.created_at
      FROM announcement_reads ar
      JOIN announcements a ON a.id = ar.announcement_id
      WHERE ar.user_id = ${user.id}
      ORDER BY ar.is_pinned DESC, a.created_at DESC
    `;

    const [unreadCount] = await sql`
      SELECT COUNT(*) FROM announcement_reads WHERE user_id = ${user.id} AND is_read = false
    `;

    return NextResponse.json({ notifications, unreadCount: unreadCount.count });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
