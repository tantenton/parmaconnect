import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookie } from "@/lib/auth/auth-service";
import { db } from "@/lib/db";
import { z } from "zod";

const COMMUNITY_ID = "seed-community-parma";

const unitSchema = z.object({
  blockId: z.string().min(1, "Blok diperlukan"),
  unitNumber: z.string().min(1, "Nomor unit diperlukan").max(20),
  displayName: z.string().max(100).optional().default(""),
  occupancyStatus: z.enum(["OWNER_OCCUPIED", "TENANT_OCCUPIED", "VACANT", "RENOVATION", "UNCONFIRMED"]).default("UNCONFIRMED"),
  ownershipStatus: z.enum(["OWNER_OCCUPIED", "TENANT_OCCUPIED", "VACANT", "RENOVATION", "UNCONFIRMED"]).default("UNCONFIRMED"),
  notes: z.string().max(1000).optional().default(""),
});

const unitFilterSchema = z.object({
  blockId: z.string().optional(),
  occupancyStatus: z.string().optional(),
  ownershipStatus: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

function isAdmin(role: string): boolean {
  return ["SUPER_ADMIN", "ADMIN"].includes(role);
}

// GET /api/admin/units — list units
export async function GET(request: NextRequest) {
  const session = await getSessionFromCookie();
  if (!session || !isAdmin(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const filters = unitFilterSchema.parse({
    blockId: searchParams.get("blockId") || undefined,
    occupancyStatus: searchParams.get("occupancyStatus") || undefined,
    ownershipStatus: searchParams.get("ownershipStatus") || undefined,
    search: searchParams.get("search") || undefined,
    page: searchParams.get("page") || "1",
    limit: searchParams.get("limit") || "20",
  });

  const where: Record<string, unknown> = { communityId: COMMUNITY_ID };
  if (filters.blockId) where.blockId = filters.blockId;
  if (filters.occupancyStatus) where.occupancyStatus = filters.occupancyStatus;
  if (filters.ownershipStatus) where.ownershipStatus = filters.ownershipStatus;
  if (filters.search) {
    where.OR = [
      { unitNumber: { contains: filters.search, mode: "insensitive" } },
      { displayName: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  const [units, total] = await Promise.all([
    db.residentialUnit.findMany({
      where,
      include: {
        block: { select: { id: true, code: true, name: true } },
        _count: { select: { households: true } },
      },
      orderBy: [{ block: { sortOrder: "asc" } }, { unitNumber: "asc" }],
      take: filters.limit,
      skip: (filters.page - 1) * filters.limit,
    }),
    db.residentialUnit.count({ where }),
  ]);

  return NextResponse.json({ units, total, page: filters.page, limit: filters.limit });
}

// POST /api/admin/units — create unit
export async function POST(request: NextRequest) {
  const session = await getSessionFromCookie();
  if (!session || !isAdmin(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const parsed = unitSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validasi gagal", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    // Verify block exists
    const block = await db.residentialBlock.findUnique({
      where: { id: parsed.data.blockId },
    });
    if (!block || block.communityId !== COMMUNITY_ID) {
      return NextResponse.json({ error: "Blok tidak ditemukan" }, { status: 404 });
    }

    // Check duplicate unit number
    const existing = await db.residentialUnit.findUnique({
      where: { communityId_unitNumber: { communityId: COMMUNITY_ID, unitNumber: parsed.data.unitNumber } },
    });
    if (existing) {
      return NextResponse.json(
        { error: `Nomor unit "${parsed.data.unitNumber}" sudah ada` },
        { status: 409 },
      );
    }

    const unit = await db.residentialUnit.create({
      data: {
        communityId: COMMUNITY_ID,
        blockId: parsed.data.blockId,
        unitNumber: parsed.data.unitNumber,
        displayName: parsed.data.displayName || null,
        occupancyStatus: parsed.data.occupancyStatus,
        ownershipStatus: parsed.data.ownershipStatus,
        notes: parsed.data.notes || null,
      },
      include: { block: { select: { code: true, name: true } } },
    });

    return NextResponse.json({ unit }, { status: 201 });
  } catch (error) {
    console.error("Unit create error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}