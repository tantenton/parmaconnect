import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookie } from "@/lib/auth/auth-service";
import { updateResident, moveOutResident } from "@/lib/household/household-service";
import { z } from "zod";

const updateSchema = z.object({
  fullName: z.string().min(1).max(200).optional(),
  familyRelationship: z.string().max(50).optional(),
  phone: z.string().max(30).optional(),
  email: z.string().email().max(200).optional(),
  residentStatus: z.enum(["ACTIVE", "INACTIVE", "PENDING"]).optional(),
  moveInDate: z.string().optional(),
  moveOutDate: z.string().optional(),
});

type RouteContext = { params: Promise<{ id: string; residentId: string }> };

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  const session = await getSessionFromCookie();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!["SUPER_ADMIN", "ADMIN"].includes(session.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id: householdId, residentId } = await params;
  const body = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Validasi gagal", details: parsed.error.flatten() }, { status: 400 });
  try {
    const existing = await (await import("@/lib/db")).db.resident.findUnique({ where: { id: residentId } });
    if (!existing || existing.householdId !== householdId) return NextResponse.json({ error: "Warga tidak ditemukan" }, { status: 404 });
    const resident = await updateResident({ userId: session.userId, communityId: session.communityId, role: session.role }, residentId, parsed.data, Object.fromEntries(req.headers.entries()));
    return NextResponse.json({ resident });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteContext) {
  const session = await getSessionFromCookie();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!["SUPER_ADMIN", "ADMIN"].includes(session.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id: householdId, residentId } = await params;
  try {
    const existing = await (await import("@/lib/db")).db.resident.findUnique({ where: { id: residentId } });
    if (!existing || existing.householdId !== householdId) return NextResponse.json({ error: "Warga tidak ditemukan" }, { status: 404 });
    const resident = await moveOutResident({ userId: session.userId, communityId: session.communityId, role: session.role }, residentId, Object.fromEntries(req.headers.entries()));
    return NextResponse.json({ resident });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
