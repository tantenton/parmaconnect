import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookie } from "@/lib/auth/auth-service";
import { listHouseholds, createHousehold } from "@/lib/household/household-service";
import { z } from "zod";

const createSchema = z.object({
  unitId: z.string().min(1),
  occupancyType: z.enum(["OWNER_OCCUPIED", "TENANT_OCCUPIED"]),
  moveInDate: z.string().optional(),
  emergencyContactName: z.string().max(100).optional(),
  emergencyContactPhone: z.string().max(30).optional(),
});

function headers(req: NextRequest): Record<string, string> {
  return Object.fromEntries(req.headers.entries());
}

export async function GET(req: NextRequest) {
  const session = await getSessionFromCookie();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!["SUPER_ADMIN", "ADMIN", "SECURITY_OFFICER", "DOCUMENT_ADMIN"].includes(session.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { searchParams } = new URL(req.url);
  const result = await listHouseholds({ userId: session.userId, communityId: session.communityId, role: session.role }, {
    search: searchParams.get("search") || undefined,
    blockId: searchParams.get("blockId") || undefined,
    unitId: searchParams.get("unitId") || undefined,
    occupancyType: searchParams.get("occupancyType") || undefined,
    verificationStatus: searchParams.get("verificationStatus") || undefined,
    active: searchParams.get("active") || undefined,
    page: parseInt(searchParams.get("page") || "1"),
    limit: parseInt(searchParams.get("limit") || "20"),
  });
  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromCookie();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!["SUPER_ADMIN", "ADMIN"].includes(session.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Validasi gagal", details: parsed.error.flatten() }, { status: 400 });
  try {
    const household = await createHousehold({ userId: session.userId, communityId: session.communityId, role: session.role }, parsed.data, headers(req));
    return NextResponse.json({ household }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
