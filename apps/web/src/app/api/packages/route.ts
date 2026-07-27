import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookie } from "@/lib/auth/auth-service";
import { createPackage, listPackages } from "@/lib/packages/package-service";
import { z } from "zod";

function isSecurity(role: string): boolean {
  return ["SUPER_ADMIN", "ADMIN", "SECURITY_OFFICER"].includes(role);
}

const createSchema = z.object({
  householdId: z.string().optional(),
  recipientName: z.string().min(1, "Nama penerima wajib diisi"),
  residentialUnitId: z.string().optional(),
  courier: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const session = await getSessionFromCookie();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || undefined;
  const search = searchParams.get("search") || undefined;
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");

  // Residents see only their own household packages
  if (session.role === "RESIDENT") {
    const resident = await (await import("@/lib/db")).db.resident.findFirst({
      where: { userId: session.userId, communityId: session.communityId },
      select: { householdId: true },
    });
    if (!resident?.householdId) {
      return NextResponse.json({ packages: [], total: 0, page: 1, limit: 20 });
    }
    const result = await listPackages(session.communityId, {
      status,
      search,
      page,
      limit,
      householdId: resident.householdId,
    });
    return NextResponse.json(result);
  }

  if (!isSecurity(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const result = await listPackages(session.communityId, { status, search, page, limit });
  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromCookie();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isSecurity(session.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Validasi gagal", details: parsed.error.flatten() }, { status: 400 });

  try {
    const pkg = await createPackage(session.communityId, session.userId, parsed.data);
    return NextResponse.json({ package: pkg }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}