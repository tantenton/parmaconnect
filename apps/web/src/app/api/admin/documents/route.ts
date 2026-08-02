import { NextRequest, NextResponse } from "next/server";

import { getSessionFromCookie } from "@/lib/auth/auth-service";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await getSessionFromCookie();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!["SUPER_ADMIN", "ADMIN", "DOCUMENT_ADMIN"].includes(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const where: Record<string, unknown> = {
    household: { communityId: session.communityId },
  };

  const documentType = searchParams.get("documentType");
  if (documentType) where.documentType = documentType;

  const status = searchParams.get("status");
  if (status) where.status = status;

  const search = searchParams.get("search");
  if (search) {
    where.OR = [
      { fileName: { contains: search, mode: "insensitive" as const } },
      { household: { householdNumber: { contains: search, mode: "insensitive" as const } } },
    ];
  }

  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const skip = (page - 1) * limit;

  const [documents, total] = await Promise.all([
    db.residentDocument.findMany({
      where,
      include: {
        household: { select: { id: true, householdNumber: true } },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip,
    }),
    db.residentDocument.count({ where }),
  ]);

  return NextResponse.json({ documents, total, page, limit });
}