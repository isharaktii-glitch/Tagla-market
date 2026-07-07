import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, message, target_role } = await req.json();
    if (!title || !message) {
      return NextResponse.json({ error: "Title and message are required" }, { status: 400 });
    }

    const result = await sql`
      INSERT INTO announcements (title, message, target_role, created_by)
      VALUES (${title}, ${message}, ${target_role || "all"}, ${user.id})
      RETURNING *
    `;
    const announcement = result[0];

    // Create a read-tracking row for every targeted user so unread counts work
    let targetUsers;
    if (target_role === "all" || !target_role) {
      targetUsers = await sql`SELECT id FROM users WHERE role != 'admin'`;
    } else {
      targetUsers = await sql`SELECT id FROM users WHERE role = ${target_role}`;
    }

    for (const u of targetUsers) {
      await sql`
        INSERT INTO announcement_reads (announcement_id, user_id, is_read)
        VALUES (${announcement.id}, ${u.id}, false)
        ON CONFLICT (announcement_id, user_id) DO NOTHING
      `;
    }

    return NextResponse.json({ announcement });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const announcements = await sql`
      SELECT a.*, 
        (SELECT COUNT(*) FROM announcement_reads WHERE announcement_id = a.id) as total_recipients,
        (SELECT COUNT(*) FROM announcement_reads WHERE announcement_id = a.id AND is_read = true) as read_count
      FROM announcements a
      ORDER BY a.created_at DESC
    `;

    return NextResponse.json({ announcements });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
