import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookie } from "@/lib/auth/auth-service";
import { db } from "@/lib/db";
import { canTransition } from "@/lib/household/household-service";
import { z } from "zod";

const updateSchema = z.object({
  fullName: z.string().min(1).max(200).optional(),
  familyRelationship: z.string().max(50).optional(),
  phone: z.string().max(30).optional(),
  email: z.string().email().max(200).optional(),
});

async function getResident() {
  const session = await getSessionFromCookie();
  if (!session || session.role !== "RESIDENT") return { session: null, resident: null };
  const user = await db.user.findUnique({ where: { id: session.userId }, include: { resident: true } });
  if (!user || user.status !== "ACTIVE" || !user.resident?.householdId) return { session, resident: null };
  return { session, resident: user.resident };
}

export async function GET() {
  const { session, resident } = await getResident();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!resident) return NextResponse.json({ error: "Profil warga belum terhubung" }, { status: 404 });
  const household = await db.household.findUnique({ where: { id: resident.householdId! }, include: { unit: { include: { block: { select: { code: true, name: true } } } }, residents: { select: { id: true, fullName: true, familyRelationship: true, residentStatus: true, phone: true, email: true, isPrimaryContact: true, moveInDate: true, moveOutDate: true } } } });
  if (!household || household.communityId !== session.communityId) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ household, currentResidentId: resident.id });
}

export async function PATCH(req: NextRequest) {
  const { session, resident } = await getResident();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!resident) return NextResponse.json({ error: "Profil warga belum terhubung" }, { status: 404 });
  const parsed = updateSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Validasi gagal", details: parsed.error.flatten() }, { status: 400 });
  const updated = await db.resident.update({ where: { id: resident.id }, data: parsed.data });
  return NextResponse.json({ resident: updated });
}

export async function POST(req: NextRequest) {
  const { session, resident } = await getResident();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!resident?.householdId) return NextResponse.json({ error: "Profil warga belum terhubung" }, { status: 404 });
  const body = await req.json().catch(() => ({}));
  const target = body.action === "submit" ? "SUBMITTED" : body.action === "resubmit" ? "SUBMITTED" : null;
  if (!target) return NextResponse.json({ error: "Aksi tidak valid" }, { status: 400 });
  const household = await db.household.findUnique({ where: { id: resident.householdId } });
  if (!household || household.communityId !== session.communityId) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!canTransition(household.verificationStatus, target)) return NextResponse.json({ error: `Transisi tidak valid: ${household.verificationStatus} → ${target}` }, { status: 400 });
  const updated = await db.household.update({ where: { id: household.id }, data: { verificationStatus: target } });
  return NextResponse.json({ household: updated });
}

export async function PUT(req: NextRequest) {
  const { session, resident } = await getResident();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!resident?.householdId) return NextResponse.json({ error: "Profil warga belum terhubung" }, { status: 404 });
  const parsed = z.object({ fullName: z.string().min(1).max(200), familyRelationship: z.string().min(1).max(50), phone: z.string().max(30).optional(), email: z.string().email().max(200).optional() }).safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Validasi gagal", details: parsed.error.flatten() }, { status: 400 });
  const member = await db.resident.create({ data: { communityId: session.communityId, householdId: resident.householdId, ...parsed.data } });
  return NextResponse.json({ resident: member }, { status: 201 });
}
