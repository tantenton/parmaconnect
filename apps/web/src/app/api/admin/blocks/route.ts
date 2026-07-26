import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookie } from "@/lib/auth/auth-service";
import { db } from "@/lib/db";
import { z } from "zod";

const COMMUNITY_ID = "seed-community-parma";

const blockSchema = z.object({
  code: z.string().min(1, "Kode blok diperlukan").max(10),
  name: z.string().min(1, "Nama blok diperlukan").max(100),
  description: z.string().max(500).optional().default(""),
  sortOrder: z.coerce.number().int().min(0).default(0),
});

function isAdmin(role: string): boolean {
  return ["SUPER_ADMIN", "ADMIN"].includes(role);
}

// GET /api/admin/blocks — list blocks
export async function GET(request: NextRequest) {
  const session = await getSessionFromCookie();
  if (!session || !isAdmin(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "20");
  const search = searchParams.get("search") ?? "";
  const status = searchParams.get("status") ?? "";

  const where: Record<string, unknown> = { communityId: COMMUNITY_ID };
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { code: { contains: search, mode: "insensitive" } },
      { name: { contains: search, mode: "insensitive" } },
    ];
  }

  const [blocks, total] = await Promise.all([
    db.residentialBlock.findMany({
      where,
      orderBy: [{ sortOrder: "asc" }, { code: "asc" }],
      take: limit,
      skip: (page - 1) * limit,
    }),
    db.residentialBlock.count({ where }),
  ]);

  return NextResponse.json({ blocks, total, page, limit });
}

// POST /api/admin/blocks — create block
export async function POST(request: NextRequest) {
  const session = await getSessionFromCookie();
  if (!session || !isAdmin(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const parsed = blockSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validasi gagal", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const existing = await db.residentialBlock.findUnique({
      where: { communityId_code: { communityId: COMMUNITY_ID, code: parsed.data.code } },
    });
    if (existing) {
      return NextResponse.json(
        { error: `Kode blok "${parsed.data.code}" sudah ada` },
        { status: 409 },
      );
    }

    const block = await db.residentialBlock.create({
      data: {
        communityId: COMMUNITY_ID,
        code: parsed.data.code,
        name: parsed.data.name,
        description: parsed.data.description || null,
        sortOrder: parsed.data.sortOrder,
      },
    });

    return NextResponse.json({ block }, { status: 201 });
  } catch (error) {
    console.error("Block create error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
