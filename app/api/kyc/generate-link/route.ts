import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import crypto from "crypto";

// This creates a Sumsub WebSDK access token for the logged-in seller.
// Requires SUMSUB_APP_TOKEN and SUMSUB_SECRET_KEY env vars (from your Sumsub dashboard).
export async function POST() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "seller") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const APP_TOKEN = process.env.SUMSUB_APP_TOKEN;
    const SECRET_KEY = process.env.SUMSUB_SECRET_KEY;

    if (!APP_TOKEN || !SECRET_KEY) {
      return NextResponse.json(
        { error: "KYC provider not configured yet. Add SUMSUB_APP_TOKEN and SUMSUB_SECRET_KEY in Vercel." },
        { status: 503 }
      );
    }

    const externalUserId = user.id;
    const levelName = "basic-kyc-level"; // must match the level name you create in Sumsub dashboard
    const ts = Math.floor(Date.now() / 1000);
    const path = `/resources/accessTokens?userId=${externalUserId}&levelName=${levelName}`;
    const signature = crypto
      .createHmac("sha256", SECRET_KEY)
      .update(ts + "POST" + path)
      .digest("hex");

    const res = await fetch(`https://api.sumsub.com${path}`, {
      method: "POST",
      headers: {
        "X-App-Token": APP_TOKEN,
        "X-App-Access-Sig": signature,
        "X-App-Access-Ts": ts.toString(),
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json({ error: data.description || "Failed to create KYC session" }, { status: 500 });
    }

    await sql`UPDATE users SET kyc_status = 'pending', kyc_reference = ${externalUserId} WHERE id = ${user.id}`;

    return NextResponse.json({ token: data.token });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
