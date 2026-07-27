import { db } from "@/lib/db";
import { createAuditLog } from "@/lib/auth/audit";
import crypto from "crypto";

// ── Visit code generation ──────────────────────────────────────────
export function generateVisitCode(): string {
  return crypto.randomBytes(4).toString("hex").toUpperCase();
}

// ── Expiry check ───────────────────────────────────────────────────
export function isExpired(validUntil: Date): boolean {
  return new Date() > validUntil;
}

// ── Create visitor (pre-register) ──────────────────────────────────
export async function createVisitor(
  communityId: string,
  householdId: string,
  data: {
    name: string;
    licensePlate?: string;
    destinationUnitId?: string;
    validFrom: Date;
    validUntil: Date;
  },
) {
  if (data.validFrom >= data.validUntil) {
    throw new Error("validFrom harus sebelum validUntil");
  }
  if (data.validUntil <= new Date()) {
    throw new Error("validUntil harus di masa depan");
  }

  let visitCode = generateVisitCode();
  // Ensure uniqueness
  const existing = await db.visitor.findUnique({ where: { visitCode } });
  if (existing) visitCode = generateVisitCode();

  const visitor = await db.visitor.create({
    data: {
      communityId,
      householdId,
      name: data.name,
      licensePlate: data.licensePlate ?? null,
      destinationUnitId: data.destinationUnitId ?? null,
      validFrom: data.validFrom,
      validUntil: data.validUntil,
      visitCode,
      status: "PENDING",
    },
  });

  await createAuditLog({
    communityId,
    action: "REGISTER",
    entityType: "VISITOR",
    entityId: visitor.id,
    details: { name: data.name, visitCode },
  });

  return visitor;
}

// ── Get visitor ────────────────────────────────────────────────────
export async function getVisitor(communityId: string, visitorId: string) {
  return db.visitor.findFirst({
    where: { id: visitorId, communityId },
  });
}

// ── Lookup by visit code ───────────────────────────────────────────
export async function lookupByCode(communityId: string, code: string) {
  const visitor = await db.visitor.findFirst({
    where: { visitCode: code, communityId },
  });
  if (!visitor) return null;
  if (isExpired(visitor.validUntil)) return null;
  if (visitor.status === "COMPLETED" || visitor.status === "REJECTED") return null;
  return visitor;
}

// ── Check-in ───────────────────────────────────────────────────────
export async function checkIn(communityId: string, visitorId: string, securityUserId: string) {
  const visitor = await db.visitor.findFirst({ where: { id: visitorId, communityId } });
  if (!visitor) throw new Error("Pengunjung tidak ditemukan");
  if (visitor.status !== "APPROVED") throw new Error("Kunjungan belum disetujui");
  if (visitor.checkInAt) throw new Error("Sudah check-in");
  if (isExpired(visitor.validUntil)) throw new Error("Kode kunjungan sudah kedaluwarsa");

  const updated = await db.visitor.update({
    where: { id: visitorId },
    data: { status: "ACTIVE", checkInAt: new Date() },
  });

  await createAuditLog({
    communityId,
    userId: securityUserId,
    action: "REGISTER",
    entityType: "VISITOR",
    entityId: visitorId,
    details: { action: "check_in", visitCode: visitor.visitCode },
  });

  return updated;
}

// ── Check-out ──────────────────────────────────────────────────────
export async function checkOut(communityId: string, visitorId: string, securityUserId: string) {
  const visitor = await db.visitor.findFirst({ where: { id: visitorId, communityId } });
  if (!visitor) throw new Error("Pengunjung tidak ditemukan");
  if (visitor.status !== "ACTIVE") throw new Error("Kunjungan tidak aktif");
  if (visitor.checkOutAt) throw new Error("Sudah check-out");

  const updated = await db.visitor.update({
    where: { id: visitorId },
    data: { status: "COMPLETED", checkOutAt: new Date() },
  });

  await createAuditLog({
    communityId,
    userId: securityUserId,
    action: "REGISTER",
    entityType: "VISITOR",
    entityId: visitorId,
    details: { action: "check_out", visitCode: visitor.visitCode },
  });

  return updated;
}

// ── Cancel visit (by resident) ─────────────────────────────────────
export async function cancelVisit(communityId: string, visitorId: string, residentId: string) {
  const visitor = await db.visitor.findFirst({ where: { id: visitorId, communityId } });
  if (!visitor) throw new Error("Pengunjung tidak ditemukan");
  if (visitor.householdId !== residentId) throw new Error("Tidak diizinkan: bukan pemilik kunjungan");
  if (visitor.status === "COMPLETED" || visitor.status === "REJECTED") {
    throw new Error("Kunjungan sudah selesai atau ditolak");
  }

  const updated = await db.visitor.update({
    where: { id: visitorId },
    data: { status: "REJECTED" },
  });

  await createAuditLog({
    communityId,
    action: "REGISTER",
    entityType: "VISITOR",
    entityId: visitorId,
    details: { action: "cancel", visitCode: visitor.visitCode },
  });

  return updated;
}

// ── Approve visit (by security/admin) ──────────────────────────────
export async function approveVisit(communityId: string, visitorId: string, userId: string) {
  const visitor = await db.visitor.findFirst({ where: { id: visitorId, communityId } });
  if (!visitor) throw new Error("Pengunjung tidak ditemukan");
  if (visitor.status !== "PENDING") throw new Error("Hanya kunjungan PENDING yang dapat disetujui");
  if (isExpired(visitor.validUntil)) throw new Error("Kode kunjungan sudah kedaluwarsa");

  const updated = await db.visitor.update({
    where: { id: visitorId },
    data: { status: "APPROVED" },
  });

  await createAuditLog({
    communityId,
    userId,
    action: "REGISTER",
    entityType: "VISITOR",
    entityId: visitorId,
    details: { action: "approve", visitCode: visitor.visitCode },
  });

  return updated;
}

// ── List active visitors (security dashboard) ──────────────────────
export async function listActive(communityId: string) {
  return db.visitor.findMany({
    where: {
      communityId,
      status: { in: ["PENDING", "APPROVED", "ACTIVE"] },
      validUntil: { gt: new Date() },
    },
    orderBy: { validFrom: "asc" },
    include: {
      household: { select: { id: true, householdNumber: true } },
    },
  });
}

// ── List by household (resident) ───────────────────────────────────
export async function listByHousehold(communityId: string, householdId: string) {
  return db.visitor.findMany({
    where: { communityId, householdId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}