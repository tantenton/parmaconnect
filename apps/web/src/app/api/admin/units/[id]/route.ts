import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookie } from "@/lib/auth/auth-service";
import { db } from "@/lib/db";
import { z } from "zod";

const COMMUNITY_ID = "seed-community-parma";

const unitUpdateSchema = z.object({
  blockId: z.string().min(1).optional(),
  unitNumber: z.string().min(1).max(20).optional(),
  displayName: z.string().max(100).optional(),
  occupancyStatus: z.enum(["OWNER_OCCUPIED", "TENANT_OCCUPIED", "VACANT", "RENOVATION", "UNCONFIRMED"]).optional(),
  ownershipStatus: z.enum(["OWNER_OCCUPIED", "TENANT_OCCUPIED", "VACANT", "RENOVATION", "UNCONFIRMED"]).optional(),
  notes: z.string().max(1000).optional(),
});

function isAdmin(role: string): boolean {
  return ["SUPER_ADMIN", "ADMIN"].includes(role);
}

// GET /api/admin/units/[id] — unit detail
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSessionFromCookie();
  if (!session || !isAdmin(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const unit = await db.residentialUnit.findUnique({
    where: { id },
    include: {
      block: { select: { id: true, code: true, name: true } },
      households: {
        include: {
          residents: { select: { id: true, fullName: true, isPrimaryContact: true } },
        },
      },
      _count: { select: { households: true } },
    },
  });

  if (!unit || unit.communityId !== COMMUNITY_ID) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ unit });
}

// PATCH /api/admin/units/[id] — update unit
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSessionFromCookie();
  if (!session || !isAdmin(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = unitUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validasi gagal", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const existing = await db.residentialUnit.findUnique({ where: { id } });
    if (!existing || existing.communityId !== COMMUNITY_ID) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // If changing unit number, check duplicate
    if (parsed.data.unitNumber && parsed.data.unitNumber !== existing.unitNumber) {
      const dup = await db.residentialUnit.findUnique({
        where: { communityId_unitNumber: { communityId: COMMUNITY_ID, unitNumber: parsed.data.unitNumber } },
      });
      if (dup) {
        return NextResponse.json(
          { error: `Nomor unit "${parsed.data.unitNumber}" sudah ada` },
          { status: 409 },
        );
      }
    }

    // If changing block, verify block exists
    if (parsed.data.blockId) {
      const block = await db.residentialBlock.findUnique({ where: { id: parsed.data.blockId } });
      if (!block || block.communityId !== COMMUNITY_ID) {
        return NextResponse.json({ error: "Blok tidak ditemukan" }, { status: 404 });
      }
    }

    const unit = await db.residentialUnit.update({
      where: { id },
      data: parsed.data,
      include: { block: { select: { code: true, name: true } } },
    });

    return NextResponse.json({ unit });
  } catch (error) {
    console.error("Unit update error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}