import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookie } from "@/lib/auth/auth-service";
import { db } from "@/lib/db";
import { z } from "zod";

const COMMUNITY_ID = "seed-community-parma";

const blockUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  sortOrder: z.coerce.number().int().min(0).optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "ARCHIVED"]).optional(),
});

function isAdmin(role: string): boolean {
  return ["SUPER_ADMIN", "ADMIN"].includes(role);
}

// GET /api/admin/blocks/[id] — block detail
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSessionFromCookie();
  if (!session || !isAdmin(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const block = await db.residentialBlock.findUnique({
    where: { id },
    include: { _count: { select: { units: true } } },
  });

  if (!block || block.communityId !== COMMUNITY_ID) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ block });
}

// PATCH /api/admin/blocks/[id] — update block
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
    const parsed = blockUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validasi gagal", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const existing = await db.residentialBlock.findUnique({ where: { id } });
    if (!existing || existing.communityId !== COMMUNITY_ID) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // If archiving, check no units with active occupancy
    if (parsed.data.status === "ARCHIVED") {
      const unitCount = await db.residentialUnit.count({
        where: {
          blockId: id,
          occupancyStatus: { in: ["OWNER_OCCUPIED", "TENANT_OCCUPIED"] },
        },
      });
      if (unitCount > 0) {
        return NextResponse.json(
          { error: `Tidak dapat mengarsipkan blok ${existing.code}: masih ada ${unitCount} unit berpenghuni` },
          { status: 409 },
        );
      }
    }

    const block = await db.residentialBlock.update({
      where: { id },
      data: parsed.data,
    });

    return NextResponse.json({ block });
  } catch (error) {
    console.error("Block update error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
