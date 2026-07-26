import { db } from "@/lib/db";
import { createAuditLog } from "@/lib/auth/audit";

export const VERIFICATION_TRANSITIONS: Record<string, string[]> = {
  UNREGISTERED: ["DRAFT"],
  DRAFT: ["SUBMITTED", "NEEDS_REVISION", "REJECTED"],
  SUBMITTED: ["VERIFIED", "NEEDS_REVISION", "REJECTED"],
  NEEDS_REVISION: ["SUBMITTED", "REJECTED", "INACTIVE"],
  VERIFIED: ["INACTIVE"],
  REJECTED: ["DRAFT", "INACTIVE"],
  INACTIVE: [],
};

export function canTransition(from: string, to: string): boolean {
  return VERIFICATION_TRANSITIONS[from]?.includes(to) ?? false;
}

export function assertTransition(from: string, to: string): void {
  if (!canTransition(from, to)) throw new Error(`Transisi tidak valid: ${from} → ${to}`);
}

export interface HouseholdSession {
  userId: string;
  communityId: string;
  role: string;
}

function ip(headers: Record<string, string>): string | undefined {
  return headers["x-forwarded-for"]?.split(",")[0]?.trim() || headers["x-real-ip"];
}

function audit(session: HouseholdSession, action: Parameters<typeof createAuditLog>[0]["action"], entityType: Parameters<typeof createAuditLog>[0]["entityType"], entityId: string, details: Record<string, unknown>, headers: Record<string, string>) {
  return createAuditLog({ communityId: session.communityId, userId: session.userId, action, entityType, entityId, details, ipAddress: ip(headers) });
}

export async function listHouseholds(session: HouseholdSession, params: { search?: string; blockId?: string; unitId?: string; occupancyType?: string; verificationStatus?: string; active?: string; page?: number; limit?: number }) {
  const where: Record<string, unknown> = { communityId: session.communityId };
  if (params.blockId) where.unit = { blockId: params.blockId };
  if (params.unitId) where.residentialUnitId = params.unitId;
  if (params.occupancyType) where.occupancyType = params.occupancyType;
  if (params.verificationStatus) where.verificationStatus = params.verificationStatus;
  if (params.active !== undefined) where.status = params.active === "true" ? "ACTIVE" : "INACTIVE";
  if (params.search) where.OR = [{ householdNumber: { contains: params.search, mode: "insensitive" } }, { emergencyContactName: { contains: params.search, mode: "insensitive" } }];
  const page = params.page ?? 1;
  const limit = params.limit ?? 20;
  const [households, total] = await Promise.all([
    db.household.findMany({ where, include: { unit: { include: { block: { select: { id: true, code: true, name: true } } } }, residents: { select: { id: true, fullName: true, familyRelationship: true, residentStatus: true, isPrimaryContact: true } } }, orderBy: { createdAt: "desc" }, take: limit, skip: (page - 1) * limit }),
    db.household.count({ where }),
  ]);
  return { households, total, page, limit };
}

export async function getHousehold(session: HouseholdSession, householdId: string) {
  const household = await db.household.findUnique({ where: { id: householdId }, include: { unit: { include: { block: { select: { id: true, code: true, name: true } } } }, residents: { select: { id: true, fullName: true, familyRelationship: true, residentStatus: true, phone: true, email: true, moveInDate: true, moveOutDate: true, isPrimaryContact: true } } } });
  if (!household || household.communityId !== session.communityId) return null;
  if (session.role === "SECURITY_OFFICER") return { ...household, emergencyContactPhone: null, residents: household.residents.map(({ phone: _phone, email: _email, ...resident }) => resident) };
  return household;
}

export async function createHousehold(session: HouseholdSession, data: { unitId: string; occupancyType: string; moveInDate?: string; emergencyContactName?: string; emergencyContactPhone?: string }, headers: Record<string, string>) {
  const unit = await db.residentialUnit.findUnique({ where: { id: data.unitId }, include: { block: true } });
  if (!unit || unit.communityId !== session.communityId) throw new Error("Unit tidak ditemukan");
  const active = await db.household.findFirst({ where: { communityId: session.communityId, residentialUnitId: data.unitId, status: "ACTIVE" } });
  if (active) throw new Error("Unit sudah memiliki keluarga aktif");
  const count = await db.household.count({ where: { communityId: session.communityId } });
  const household = await db.household.create({ data: { communityId: session.communityId, residentialUnitId: data.unitId, householdNumber: `KK-${String(count + 1).padStart(4, "0")}`, occupancyType: data.occupancyType as never, startDate: data.moveInDate ? new Date(data.moveInDate) : new Date(), emergencyContactName: data.emergencyContactName || null, emergencyContactPhone: data.emergencyContactPhone || null }, include: { unit: { include: { block: { select: { code: true, name: true } } } } } });
  await audit(session, "REGISTER", "HOUSEHOLD", household.id, { householdNumber: household.householdNumber }, headers);
  return household;
}

export async function updateHousehold(session: HouseholdSession, householdId: string, data: { occupancyType?: string; moveInDate?: string; moveOutDate?: string; emergencyContactName?: string; emergencyContactPhone?: string; headResidentId?: string; primaryContactResidentId?: string; status?: string; verificationStatus?: string }, headers: Record<string, string>) {
  const existing = await db.household.findUnique({ where: { id: householdId }, include: { residents: true } });
  if (!existing || existing.communityId !== session.communityId) throw new Error("Keluarga tidak ditemukan");
  if (data.headResidentId && !existing.residents.some((r) => r.id === data.headResidentId)) throw new Error("Kepala keluarga harus anggota keluarga");
  if (data.primaryContactResidentId && !existing.residents.some((r) => r.id === data.primaryContactResidentId)) throw new Error("Kontak utama harus anggota keluarga");
  if (data.verificationStatus && data.verificationStatus !== existing.verificationStatus) assertTransition(existing.verificationStatus, data.verificationStatus);
  const updateData: Record<string, unknown> = {};
  if (data.occupancyType) updateData.occupancyType = data.occupancyType;
  if (data.moveInDate) updateData.startDate = new Date(data.moveInDate);
  if (data.moveOutDate) updateData.endDate = new Date(data.moveOutDate);
  if (data.emergencyContactName !== undefined) updateData.emergencyContactName = data.emergencyContactName || null;
  if (data.emergencyContactPhone !== undefined) updateData.emergencyContactPhone = data.emergencyContactPhone || null;
  if (data.headResidentId) updateData.headResidentId = data.headResidentId;
  if (data.primaryContactResidentId) updateData.primaryContactResidentId = data.primaryContactResidentId;
  if (data.status) updateData.status = data.status;
  if (data.verificationStatus) updateData.verificationStatus = data.verificationStatus;
  const household = await db.household.update({ where: { id: householdId }, data: updateData });
  await audit(session, data.verificationStatus ? "DOCUMENT_VERIFY" : "REGISTER", "HOUSEHOLD", householdId, { changes: Object.keys(updateData) }, headers);
  return household;
}

export async function deactivateHousehold(session: HouseholdSession, householdId: string, headers: Record<string, string>) {
  const existing = await db.household.findUnique({ where: { id: householdId } });
  if (!existing || existing.communityId !== session.communityId) throw new Error("Keluarga tidak ditemukan");
  if (existing.status === "INACTIVE") return existing;
  const household = await db.household.update({ where: { id: householdId }, data: { status: "INACTIVE", endDate: new Date(), verificationStatus: "INACTIVE" } });
  await audit(session, "ACCOUNT_DISABLE", "HOUSEHOLD", householdId, { householdNumber: existing.householdNumber }, headers);
  return household;
}

export async function addResident(session: HouseholdSession, householdId: string, data: { fullName: string; familyRelationship: string; phone?: string; email?: string; moveInDate?: string }, headers: Record<string, string>) {
  const household = await db.household.findUnique({ where: { id: householdId } });
  if (!household || household.communityId !== session.communityId) throw new Error("Keluarga tidak ditemukan");
  const resident = await db.resident.create({ data: { communityId: session.communityId, householdId, fullName: data.fullName, familyRelationship: data.familyRelationship, phone: data.phone || null, email: data.email || null, moveInDate: data.moveInDate ? new Date(data.moveInDate) : new Date() } });
  await audit(session, "REGISTER", "RESIDENT", resident.id, { householdId, relationship: data.familyRelationship }, headers);
  return resident;
}

export async function updateResident(session: HouseholdSession, residentId: string, data: { fullName?: string; familyRelationship?: string; phone?: string; email?: string; residentStatus?: string; moveInDate?: string; moveOutDate?: string }, headers: Record<string, string>) {
  const existing = await db.resident.findUnique({ where: { id: residentId } });
  if (!existing || existing.communityId !== session.communityId) throw new Error("Warga tidak ditemukan");
  const updateData: Record<string, unknown> = { ...data };
  if (data.moveInDate) updateData.moveInDate = new Date(data.moveInDate);
  if (data.moveOutDate) updateData.moveOutDate = new Date(data.moveOutDate);
  const resident = await db.resident.update({ where: { id: residentId }, data: updateData });
  await audit(session, "REGISTER", "RESIDENT", residentId, { changes: Object.keys(data) }, headers);
  return resident;
}

export async function moveOutResident(session: HouseholdSession, residentId: string, headers: Record<string, string>) {
  const existing = await db.resident.findUnique({ where: { id: residentId } });
  if (!existing || existing.communityId !== session.communityId) throw new Error("Warga tidak ditemukan");
  const resident = await db.resident.update({ where: { id: residentId }, data: { residentStatus: "INACTIVE", moveOutDate: new Date() } });
  await audit(session, "SESSION_REVOKE", "RESIDENT", residentId, { householdId: existing.householdId, reason: "moved_out" }, headers);
  return resident;
}
