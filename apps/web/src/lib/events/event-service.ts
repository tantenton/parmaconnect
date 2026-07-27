import { db } from "@/lib/db";
import { createAuditLog } from "@/lib/auth/audit";

// ── Create event ──────────────────────────────────────────────────
export async function createEvent(
  communityId: string,
  organizerId: string,
  data: {
    title: string;
    description?: string;
    location?: string;
    startsAt: Date;
    endsAt: Date;
    capacity?: number;
  },
) {
  if (data.endsAt < data.startsAt) throw new Error("Tanggal akhir tidak boleh sebelum tanggal mulai");
  
  const event = await db.event.create({
    data: {
      communityId,
      title: data.title,
      description: data.description ?? null,
      location: data.location ?? null,
   startsAt: data.startsAt,
      endsAt: data.endsAt,
   capacity: data.capacity ?? null,
      status: "DRAFT",
      organizerId,
    },
    include: { organizer: { select: { id: true, name: true, role: true } } },
  });

  await createAuditLog({
    communityId,
    userId: organizerId,
    action: "REGISTER",
    entityType: "EVENT",
 entityId: event.id,
    details: { title: data.title },
  });

  return event;
}

// ── Publish event ─────────────────────────────────────────────────
export async function publishEvent(communityId: string, eventId: string, adminId: string) {
  const event = await db.event.findFirst({ where: { id: eventId, communityId } });
  if (!event) throw new Error("Event tidak ditemukan");
  if (event.status !== "DRAFT") throw new Error("Hanya event DRAFT yang dapat dipublikasi");

  const updated = await db.event.update({
    where: { id: eventId },
    data: { status: "ACTIVE" },
  });

  await createAuditLog({ communityId, userId: adminId, action: "REGISTER", entityType: "EVENT", entityId: eventId, details: { action: "publish" } });
  return updated;
}

// ── Cancel event ──────────────────────────────────────────────────
export async function cancelEvent(communityId: string, eventId: string, adminId: string) {
  const event = await db.event.findFirst({ where: { id: eventId, communityId } });
  if (!event) throw new Error("Event tidak ditemukan");
  if (event.status === "CANCELLED") throw new Error("Event sudah dibatalkan");

  const updated = await db.event.update({
    where: { id: eventId },
    data: { status: "CANCELLED" },
  });

  await createAuditLog({ communityId, userId: adminId, action: "REGISTER", entityType: "EVENT", entityId: eventId, details: { action: "cancel" } });
  return updated;
}

// ── Register attendance ───────────────────────────────────────────
export async function registerAttendance(communityId: string, eventId: string, userId: string) {
  const event = await db.event.findFirst({
    where: { id: eventId, communityId },
    include: { _count: { select: { attendees: { where: { status: "CONFIRMED" } } } } },
  });

  if (!event) throw new Error("Event tidak ditemukan");
  if (event.status !== "ACTIVE") throw new Error("Event tidak aktif");
  
  // Capacity check
  if (event.capacity && event._count.attendees >= event.capacity) {
    throw new Error("Kapasitas penuh");
  }

  // Duplicate check (handled by unique constraint, but explicit for better error)
  const existing = await db.eventAttendee.findUnique({
    where: { eventId_userId: { eventId, userId } },
  });
  if (existing && existing.status === "CONFIRMED") {
 throw new Error("Anda sudah terdaftar");
  }

  // Atomic upsert for race-condition safety
  const attendee = await db.eventAttendee.upsert({
    where: { eventId_userId: { eventId, userId } },
    update: { status: "CONFIRMED" },
    create: { eventId, userId, status: "CONFIRMED" },
  });

  return attendee;
}

// ── Cancel attendance ─────────────────────────────────────────────
export async function cancelAttendance(communityId: string, eventId: string, userId: string) {
  const event = await db.event.findFirst({ where: { id: eventId, communityId } });
  if (!event) throw new Error("Event tidak ditemukan");

  const attendee = await db.eventAttendee.findUnique({
    where: { eventId_userId: { eventId, userId } },
  });
  if (!attendee) throw new Error("Anda tidak terdaftar");

  const updated = await db.eventAttendee.update({
    where: { eventId_userId: { eventId, userId } },
    data: { status: "CANCELLED" },
  });

  return updated;
}

// ── List events ───────────────────────────────────────────────────
export async function listEvents(
  communityId: string,
  params: { status?: string; upcoming?: boolean; page?: number; limit?: number } = {},
) {
  const where: Record<string, unknown> = { communityId };
  if (params.status) where.status = params.status;
  if (params.upcoming) where.startsAt = { gte: new Date() };

  const page = params.page ?? 1;
  const limit = params.limit ?? 20;
  const [events, total] = await Promise.all([
    db.event.findMany({
      where,
      include: {
 organizer: { select: { id: true, name: true } },
        _count: { select: { attendees: { where: { status: "CONFIRMED" } } } },
      },
      orderBy: { startsAt: "asc" },
    take: limit,
      skip: (page - 1) * limit,
    }),
    db.event.count({ where }),
  ]);

return { events, total, page, limit };
}

// ── Get event detail ──────────────────────────────────────────────
export async function getEvent(communityId: string, eventId: string, userId?: string) {
  const event = await db.event.findFirst({
    where: { id: eventId, communityId },
    include: {
      organizer: { select: { id: true, name: true } },
    attendees: {
        where: { status: "CONFIRMED" },
        include: { user: { select: { id: true, name: true } } },
      },
      _count: { select: { attendees: { where: { status: "CONFIRMED" } } } },
    },
  });

  if (!event) return null;

  // Check if current user is registered
  let isRegistered = false;
  if (userId) {
    const attendee = await db.eventAttendee.findUnique({
      where: { eventId_userId: { eventId, userId } },
    });
    isRegistered = attendee?.status === "CONFIRMED";
}

  return { ...event, isRegistered };
}
