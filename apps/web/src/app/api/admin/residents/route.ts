import { NextRequest, NextResponse } from "next/server";

import { getSessionFromCookie } from "@/lib/auth/auth-service";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await getSessionFromCookie();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!["SUPER_ADMIN", "ADMIN"].includes(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const where: Record<string, unknown> = {
    household: { communityId: session.communityId },
  };

  // Cari berdasarkan nama
  const search = searchParams.get("search");
  if (search) {
    where.fullName = { contains: search, mode: "insensitive" as const };
  }

  // Filter houseNumber sebagai proxy pencarian
  const blockId = searchParams.get("blockId");
  if (blockId) {
    where.household = {
      ...(where.household as Record<string, unknown>),
      residentialUnit: { blockId },
    };
  }

  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const skip = (page - 1) * limit;

  const [residents, total] = await Promise.all([
    db.resident.findMany({
      where,
      include: {
        household: {
          include: {
            unit: {
              include: { block: { select: { id: true, code: true, name: true } } },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip,
    }),
    db.resident.count({ where }),
  ]);

  return NextResponse.json({ residents, total, page, limit });
}
