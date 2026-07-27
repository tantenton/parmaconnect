import { db } from "@/lib/db";
import { createAuditLog } from "@/lib/auth/audit";

export function normalizeLicensePlate(plate: string): string {
  return plate.toUpperCase().replace(/\s+/g, "");
}

// ── Create vehicle ──────────────────────────────────────────────────
export async function createVehicle(
  communityId: string,
  residentId: string,
  data: {
    licensePlate: string;
    vehicleType: string;
    brand?: string;
    model?: string;
    color?: string;
    stickerNumber?: string;
    householdId?: string;
  },
) {
  const licensePlate = normalizeLicensePlate(data.licensePlate);

  // Check duplicate plate in community
  const existing = await db.vehicle.findFirst({
    where: { communityId, licensePlate, status: { not: "EXPIRED" } },
  });
  if (existing) throw new Error("Plat nomor sudah terdaftar di komunitas ini");

  const vehicle = await db.vehicle.create({
    data: {
      communityId,
      licensePlate,
      vehicleType: data.vehicleType as never,
      brand: data.brand ?? null,
      model: data.model ?? null,
      color: data.color ?? null,
      stickerNumber: data.stickerNumber ?? null,
      status: "ACTIVE",
      validFrom: new Date(),
      residentId,
      householdId: data.householdId ?? null,
    },
    include: {
      resident: { select: { id: true, fullName: true } },
      household: { select: { id: true, householdNumber: true } },
    },
  });

  await createAuditLog({
    communityId,
    userId: residentId,
    action: "REGISTER",
    entityType: "VEHICLE",
    entityId: vehicle.id,
    details: { licensePlate, vehicleType: data.vehicleType },
  });

  return vehicle;
}

// ── List vehicles ───────────────────────────────────────────────────
export async function listVehicles(
  communityId: string,
  params: {
    status?: string;
    vehicleType?: string;
    residentId?: string;
    householdId?: string;
    search?: string;
    page?: number;
    limit?: number;
  } = {},
) {
  const where: Record<string, unknown> = { communityId };
  if (params.status) where.status = params.status;
  if (params.vehicleType) where.vehicleType = params.vehicleType;
  if (params.residentId) where.residentId = params.residentId;
  if (params.householdId) where.householdId = params.householdId;
  if (params.search) {
    where.OR = [
      { licensePlate: { contains: params.search, mode: "insensitive" } },
      { brand: { contains: params.search, mode: "insensitive" } },
      { model: { contains: params.search, mode: "insensitive" } },
    ];
  }
  const page = params.page ?? 1;
  const limit = params.limit ?? 20;
  const [vehicles, total] = await Promise.all([
    db.vehicle.findMany({
      where,
      include: {
        resident: { select: { id: true, fullName: true } },
        household: { select: { id: true, householdNumber: true } },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: (page - 1) * limit,
    }),
    db.vehicle.count({ where }),
  ]);
  return { vehicles, total, page, limit };
}

// ── Get single vehicle ──────────────────────────────────────────────
export async function getVehicle(communityId: string, vehicleId: string) {
  return db.vehicle.findFirst({
    where: { id: vehicleId, communityId },
    include: {
      resident: { select: { id: true, fullName: true } },
      household: { select: { id: true, householdNumber: true } },
    },
  });
}

// ── Search by plate (audited) ───────────────────────────────────────
export async function searchByPlate(
  communityId: string,
  plate: string,
  searcherId: string,
) {
  const licensePlate = normalizeLicensePlate(plate);
  const vehicles = await db.vehicle.findMany({
    where: { communityId, licensePlate: { contains: licensePlate, mode: "insensitive" } },
    include: {
      resident: { select: { id: true, fullName: true } },
      household: { select: { id: true, householdNumber: true } },
    },
  });

  await createAuditLog({
    communityId,
    userId: searcherId,
    action: "REGISTER",
    entityType: "VEHICLE",
    details: { action: "plate_search", query: licensePlate, results: vehicles.length },
  });

  return vehicles;
}

// ── Admin: approve (set ACTIVE) ─────────────────────────────────────
export async function approveVehicle(communityId: string, vehicleId: string, adminId: string) {
  const vehicle = await db.vehicle.findFirst({ where: { id: vehicleId, communityId } });
  if (!vehicle) throw new Error("Kendaraan tidak ditemukan");
  if (vehicle.status === "ACTIVE") throw new Error("Kendaraan sudah aktif");

  const updated = await db.vehicle.update({
    where: { id: vehicleId },
    data: { status: "ACTIVE", validFrom: new Date() },
  });

  await createAuditLog({
    communityId,
    userId: adminId,
    action: "REGISTER",
    entityType: "VEHICLE",
    entityId: vehicleId,
    details: { action: "approve", previousStatus: vehicle.status },
  });

  return updated;
}

// ── Admin: suspend ──────────────────────────────────────────────────
export async function suspendVehicle(communityId: string, vehicleId: string, adminId: string) {
  const vehicle = await db.vehicle.findFirst({ where: { id: vehicleId, communityId } });
  if (!vehicle) throw new Error("Kendaraan tidak ditemukan");
  if (vehicle.status === "SUSPENDED") throw new Error("Kendaraan sudah ditangguhkan");

  const updated = await db.vehicle.update({
    where: { id: vehicleId },
    data: { status: "SUSPENDED" },
  });

  await createAuditLog({
    communityId,
    userId: adminId,
    action: "REGISTER",
    entityType: "VEHICLE",
    entityId: vehicleId,
    details: { action: "suspend", previousStatus: vehicle.status },
  });

  return updated;
}

// ── Expire vehicles ─────────────────────────────────────────────────
export async function expireVehicles() {
  const now = new Date();
  const vehicles = await db.vehicle.updateMany({
    where: { validUntil: { lte: now }, status: "ACTIVE" },
    data: { status: "EXPIRED" },
  });
  return vehicles;
}
