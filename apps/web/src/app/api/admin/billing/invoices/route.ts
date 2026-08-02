import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookie } from "@/lib/auth/auth-service";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await getSessionFromCookie();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!["SUPER_ADMIN", "ADMIN", "FINANCE_ADMIN"].includes(session.role))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const where: Record<string, unknown> = {
    household: { communityId: session.communityId },
  };
  const status = searchParams.get("status");
  if (status) where.status = status;

  const search = searchParams.get("search");
  if (search) {
    where.OR = [
      { invoiceNumber: { contains: search, mode: "insensitive" as const } },
      { household: { householdNumber: { contains: search, mode: "insensitive" as const } } },
    ];
  }
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const skip = (page - 1) * limit;

  const [invoices, total] = await Promise.all([
    db.invoice.findMany({
      where,
      include: { billingRule: true, items: true, household: { include: { unit: { include: { block: true } } } } },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip,
    }),
    db.invoice.count({ where }),
  ]);
  return NextResponse.json({ invoices, total, page, limit });
}