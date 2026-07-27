import { db } from "@/lib/db";
import { createAuditLog } from "@/lib/auth/audit";

// ── Transition policy ──────────────────────────────────────────────
const TRANSITIONS: Record<string, string[]> = {
  ARRIVED: ["NOTIFIED", "RETURNED", "EXPIRED"],
  NOTIFIED: ["PICKED_UP", "RETURNED", "EXPIRED"],
  PICKED_UP: [],
  RETURNED: [],
  EXPIRED: [],
};

export function assertTransition(from: string, to: string): void {
  const allowed = TRANSITIONS[from] ?? [];
  if (!allowed.includes(to)) throw new Error(`Tidak dapat mengubah status dari ${from} ke ${to}`);
}

// ── Permission helpers ─────────────────────────────────────────────
function isSecurity(role: string): boolean {
  return ["SUPER_ADMIN", "ADMIN", "SECURITY_OFFICER"].includes(role);
}

// ── Create package ─────────────────────────────────────────────────
export async function createPackage(
  communityId: string,
  userId: string,
  data: {
    householdId?: string;
    recipientName: string;
    residentialUnitId?: string;
    courier?: string;
  },
) {
  const pkg = await db.package.create({
    data: {
      communityId,
      householdId: data.householdId ?? null,
      recipientName: data.recipientName,
      residentialUnitId: data.residentialUnitId ?? null,
      courier: data.courier ?? null,
      status: "ARRIVED",
    },
    include: {
      household: { select: { id: true, householdNumber: true } },
    },
  });

  await createAuditLog({
    communityId,
    userId,
    action: "REGISTER",
    entityType: "VEHICLE",
    entityId: pkg.id,
    details: { recipientName: data.recipientName, courier: data.courier },
  });

  return pkg;
}

// ── List packages ──────────────────────────────────────────────────
export async function listPackages(
  communityId: string,
  params: {
    status?: string;
    householdId?: string;
    search?: string;
    page?: number;
    limit?: number;
  } = {},
) {
  const where: Record<string, unknown> = { communityId };
  if (params.status) where.status = params.status;
  if (params.householdId) where.householdId = params.householdId;
  if (params.search) {
    where.OR = [
      { recipientName: { contains: params.search, mode: "insensitive" } },
      { courier: { contains: params.search, mode: "insensitive" } },
    ];
  }

  const page = params.page ?? 1;
  const limit = params.limit ?? 20;
  const [packages, total] = await Promise.all([
    db.package.findMany({
      where,
      include: {
        household: { select: { id: true, householdNumber: true } },
      },
      orderBy: { arrivalAt: "desc" },
      take: limit,
      skip: (page - 1) * limit,
    }),
    db.package.count({ where }),
  ]);
  return { packages, total, page, limit };
}

// ── Get package detail ─────────────────────────────────────────────
export async function getPackage(
  communityId: string,
  packageId: string,
  viewerRole: string,
  viewerUserId: string,
) {
  const pkg = await db.package.findFirst({
    where: { id: packageId, communityId },
    include: {
      household: { select: { id: true, householdNumber: true } },
    },
  });
  if (!pkg) return null;

  // Resident: only own household packages
  if (viewerRole === "RESIDENT") {
    const resident = await db.resident.findFirst({
      where: { userId: viewerUserId, communityId },
      select: { householdId: true },
    });
    if (!resident || resident.householdId !== pkg.householdId) return null;
  }

  return pkg;
}

// ── Notify resident ────────────────────────────────────────────────
export async function notifyResident(
  communityId: string,
  packageId: string,
  userId: string,
) {
  const pkg = await db.package.findFirst({ where: { id: packageId, communityId } });
  if (!pkg) throw new Error("Paket tidak ditemukan");
  assertTransition(pkg.status, "NOTIFIED");

  const updated = await db.package.update({
    where: { id: packageId },
    data: { status: "NOTIFIED" },
    include: {
      household: { select: { id: true, householdNumber: true } },
    },
  });

  await createAuditLog({
    communityId,
    userId,
    action: "REGISTER",
    entityType: "VEHICLE",
    entityId: packageId,
    details: { action: "notify", previousStatus: pkg.status },
  });

  return updated;
}

// ── Mark picked up ─────────────────────────────────────────────────
export async function markPickedUp(
  communityId: string,
  packageId: string,
  userId: string,
) {
  const pkg = await db.package.findFirst({ where: { id: packageId, communityId } });
  if (!pkg) throw new Error("Paket tidak ditemukan");
  assertTransition(pkg.status, "PICKED_UP");

  const updated = await db.package.update({
    where: { id: packageId },
    data: { status: "PICKED_UP", pickupAt: new Date() },
    include: {
      household: { select: { id: true, householdNumber: true } },
    },
  });

  await createAuditLog({
    communityId,
    userId,
    action: "REGISTER",
    entityType: "VEHICLE",
    entityId: packageId,
    details: { action: "pickup", previousStatus: pkg.status },
  });

  return updated;
}

// ── Return package ─────────────────────────────────────────────────
export async function returnPackage(
  communityId: string,
  packageId: string,
  userId: string,
  reason?: string,
) {
  const pkg = await db.package.findFirst({ where: { id: packageId, communityId } });
  if (!pkg) throw new Error("Paket tidak ditemukan");
  assertTransition(pkg.status, "RETURNED");

  const updated = await db.package.update({
    where: { id: packageId },
    data: { status: "RETURNED" },
    include: {
      household: { select: { id: true, householdNumber: true } },
    },
  });

  await createAuditLog({
    communityId,
    userId,
    action: "REGISTER",
    entityType: "VEHICLE",
    entityId: packageId,
    details: { action: "return", reason, previousStatus: pkg.status },
  });

  return updated;
}

// ── List by household (resident convenience) ───────────────────────
export async function listByHousehold(
  communityId: string,
  householdId: string,
  params: {
    status?: string;
    page?: number;
    limit?: number;
  } = {},
) {
  return listPackages(communityId, { ...params, householdId });
}