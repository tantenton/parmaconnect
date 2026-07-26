import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookie } from "@/lib/auth/auth-service";
import { getHousehold, updateHousehold, deactivateHousehold } from "@/lib/household/household-service";
import { z } from "zod";

const updateSchema = z.object({
  occupancyType: z.enum(["OWNER_OCCUPIED", "TENANT_OCCUPIED"]).optional(),
  moveInDate: z.string().optional(),
  moveOutDate: z.string().optional(),
  emergencyContactName: z.string().max(100).optional(),
  emergencyContactPhone: z.string().max(30).optional(),
  headResidentId: z.string().optional(),
  primaryContactResidentId: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "ARCHIVED"]).optional(),
  verificationStatus: z.enum(["UNREGISTERED", "DRAFT", "SUBMITTED", "NEEDS_REVISION", "VERIFIED", "REJECTED", "INACTIVE"]).optional(),
});

function h(req: NextRequest): Record<string, string> {
  return Object.fromEntries(req.headers.entries());
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionFromCookie();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!["SUPER_ADMIN", "ADMIN", "SECURITY_OFFICER", "DOCUMENT_ADMIN"].includes(session.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  const household = await getHousehold({ userId: session.userId, communityId: session.communityId, role: session.role }, id);
  if (!household) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ household });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionFromCookie();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!["SUPER_ADMIN", "ADMIN"].includes(session.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Validasi gagal", details: parsed.error.flatten() }, { status: 400 });
  try {
    const household = await updateHousehold({ userId: session.userId, communityId: session.communityId, role: session.role }, id, parsed.data, h(req));
    return NextResponse.json({ household });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionFromCookie();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!["SUPER_ADMIN", "ADMIN"].includes(session.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  try {
    const household = await deactivateHousehold({ userId: session.userId, communityId: session.communityId, role: session.role }, id, h(req));
    return NextResponse.json({ household });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
