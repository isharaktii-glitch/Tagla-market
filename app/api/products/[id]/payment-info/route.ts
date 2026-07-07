import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const productResult = await sql`
      SELECT p.id, u.bank_name as seller_bank_name, u.bank_acc_no as seller_bank_acc_no, 
        u.bank_acc_name as seller_bank_acc_name
      FROM products p
      JOIN users u ON u.id = p.seller_id
      WHERE p.id = ${params.id}
    `;

    if (productResult.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const product = productResult[0];

    // If seller has their own bank details, use those. Otherwise fallback to admin's bank details.
    if (product.seller_bank_name && product.seller_bank_acc_no) {
      return NextResponse.json({
        source: "seller",
        bank_name: product.seller_bank_name,
        bank_acc_no: product.seller_bank_acc_no,
        bank_acc_name: product.seller_bank_acc_name,
      });
    }

    const adminBanks = await sql`
      SELECT bank_name, bank_acc_no, bank_acc_name FROM admin_bank_details WHERE is_active = true LIMIT 1
    `;

    if (adminBanks.length > 0) {
      return NextResponse.json({
        source: "admin",
        bank_name: adminBanks[0].bank_name,
        bank_acc_no: adminBanks[0].bank_acc_no,
        bank_acc_name: adminBanks[0].bank_acc_name,
      });
    }

    return NextResponse.json({ source: "none" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
