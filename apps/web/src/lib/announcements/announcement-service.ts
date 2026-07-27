import { db } from "@/lib/db";
import { createAuditLog } from "@/lib/auth/audit";

export const ANNOUNCEMENT_CATEGORIES = ["GENERAL", "SECURITY", "CLEANLINESS", "MAINTENANCE", "EVENT", "EMERGENCY"] as const;
export const ANNOUNCEMENT_PRIORITIES = ["LOW", "NORMAL", "HIGH", "URGENT"] as const;
export const ANNOUNCEMENT_STATUSES = ["DRAFT", "SCHEDULED", "PUBLISHED", "EXPIRED", "ARCHIVED"] as const;
export const ANNOUNCEMENT_AUDIENCES = ["ALL", "RESIDENTS", "STAFF", "SECURITY", "FINANCE", "ADMINS"] as const;

const PRIORITY_ORDER: Record<string, number> = { URGENT: 0, HIGH: 1, NORMAL: 2, LOW: 3 };

export function assertTransition(from: string, to: string): void {
  const transitions: Record<string, string[]> = {
    DRAFT: ["SCHEDULED", "PUBLISHED", "ARCHIVED"],
    SCHEDULED: ["PUBLISHED", "DRAFT", "ARCHIVED"],
    PUBLISHED: ["EXPIRED", "ARCHIVED", "DRAFT"],
    EXPIRED: ["ARCHIVED"],
    ARCHIVED: [],
  };
  const allowed = transitions[from] ?? [];
  if (!allowed.includes(to)) throw new Error(`Tidak dapat transit dari ${from} ke ${to}`);
}

export function isCurrentlyVisible(
  ann: { status: string; startsAt: Date | null; expiresAt: Date | null },
  now: Date = new Date(),
): boolean {
  if (ann.status === "EXPIRED" || ann.status === "ARCHIVED" || ann.status === "DRAFT") return false;
  if (ann.status === "SCHEDULED") {
    if (!ann.startsAt || now < ann.startsAt) return false;
    if (ann.expiresAt && now > ann.expiresAt) return false;
    return true;
  }
  if (ann.status !== "PUBLISHED") return false;
  if (ann.startsAt && now < ann.startsAt) return false;
  if (ann.expiresAt && now > ann.expiresAt) return false;
  return true;
}

export function canAudienceView(audience: string, role: string): boolean {
  switch (audience) {
    case "ALL":
    case "RESIDENTS":
      return true;
    case "STAFF":
      return ["SUPER_ADMIN", "ADMIN", "STAFF", "DOCUMENT_ADMIN"].includes(role);
    case "SECURITY":
      return ["SUPER_ADMIN", "ADMIN", "SECURITY_OFFICER"].includes(role);
    case "FINANCE":
      return ["SUPER_ADMIN", "ADMIN", "FINANCE_ADMIN"].includes(role);
    case "ADMINS":
      return ["SUPER_ADMIN", "ADMIN"].includes(role);
    default:
      return false;
  }
}

export function canViewTargetBlocks(
  targetBlockIds: unknown,
  viewerBlockId: string | null | undefined,
  role: string,
): boolean {
  if (!targetBlockIds) return true;
  const ids = Array.isArray(targetBlockIds) ? (targetBlockIds as string[]) : [];
  if (ids.length === 0) return true;
  if (["SUPER_ADMIN", "ADMIN", "DOCUMENT_ADMIN", "STAFF"].includes(role)) return true;
  if (!viewerBlockId) return false;
  return ids.includes(viewerBlockId);
}

export type ViewerContext = {
  role: string;
  userId: string;
  communityId: string;
  blockId?: string | null;
  forAdmin?: boolean;
};

export async function listAnnouncements(
  communityId: string,
  params: {
    category?: string;
    status?: string;
    priority?: string;
    search?: string;
    page?: number;
    limit?: number;
    includeHidden?: boolean;
  } = {},
  viewer?: ViewerContext,
) {
  const where: Record<string, unknown> = { communityId };
  if (params.category) where.category = params.category;
  if (params.status) where.status = params.status;
  if (params.priority) where.priority = params.priority;
  if (params.search) {
    where.OR = [
      { title: { contains: params.search, mode: "insensitive" } },
      { content: { contains: params.search, mode: "insensitive" } },
    ];
  }

  const page = params.page ?? 1;
  const limit = params.limit ?? 20;
  const [rows, total] = await Promise.all([
    db.announcement.findMany({
      where,
      include: {
        author: { select: { id: true, name: true, role: true } },
        _count: { select: { reads: true } },
      },
      orderBy: [{ priority: "asc" }, { startsAt: "desc" }],
      take: limit * 3,
      skip: 0,
    }),
    db.announcement.count({ where }),
  ]);

  let filtered = rows;
  if (viewer && !params.includeHidden && !viewer.forAdmin) {
    filtered = rows.filter(
      (a) =>
        isCurrentlyVisible(a) &&
        canAudienceView(a.audience, viewer.role) &&
        canViewTargetBlocks(a.targetBlockIds, viewer.blockId, viewer.role),
    );
  }

  filtered = [...filtered].sort((a, b) => {
    const pa = PRIORITY_ORDER[a.priority] ?? 9;
    const pb = PRIORITY_ORDER[b.priority] ?? 9;
    if (pa !== pb) return pa - pb;
    return new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime();
  });

  const paged = filtered.slice((page - 1) * limit, page * limit);
  return { announcements: paged, total: viewer && !viewer.forAdmin ? filtered.length : total, page, limit };
}

export async function getAnnouncement(communityId: string, announcementId: string, viewer?: ViewerContext) {
  const a = await db.announcement.findFirst({
    where: { id: announcementId, communityId },
    include: {
      author: { select: { id: true, name: true, role: true } },
      _count: { select: { reads: true } },
    },
  });
  if (!a) return null;
  if (viewer && !viewer.forAdmin) {
    if (!isCurrentlyVisible(a)) return null;
    if (!canAudienceView(a.audience, viewer.role)) return null;
    if (!canViewTargetBlocks(a.targetBlockIds, viewer.blockId, viewer.role)) return null;
  }
  return a;
}

export async function createAnnouncement(
  communityId: string,
  authorId: string,
  data: {
    title: string;
    content: string;
    category: string;
    priority: string;
    audience: string;
    startsAt?: string;
    expiresAt?: string;
    targetBlockIds?: string[];
    attachmentMeta?: unknown;
    schedule?: boolean;
  },
) {
  const startsAt = data.startsAt ? new Date(data.startsAt) : new Date();
  const expiresAt = data.expiresAt ? new Date(data.expiresAt) : null;
  const status = data.schedule && startsAt > new Date() ? "SCHEDULED" : "DRAFT";

  const announcement = await db.announcement.create({
    data: {
      communityId,
      title: data.title,
      content: data.content,
      category: data.category as never,
      priority: data.priority as never,
      audience: data.audience as never,
      status: status as never,
      createdById: authorId,
      startsAt,
      expiresAt,
      targetBlockIds: data.targetBlockIds ?? undefined,
      attachmentMeta: data.attachmentMeta ?? undefined,
    },
    include: { author: { select: { id: true, name: true, role: true } } },
  });

  await createAuditLog({
    communityId,
    userId: authorId,
    action: "REGISTER",
    entityType: "ANNOUNCEMENT",
    entityId: announcement.id,
    details: { title: data.title, category: data.category, priority: data.priority, status },
  });
  return announcement;
}

export async function publishAnnouncement(communityId: string, announcementId: string, publisherId: string) {
  const a = await db.announcement.findFirst({ where: { id: announcementId, communityId } });
  if (!a) throw new Error("Pengumuman tidak ditemukan");
  assertTransition(a.status, "PUBLISHED");
  const announced = await db.announcement.update({
    where: { id: announcementId },
    data: { status: "PUBLISHED", publishedAt: new Date(), startsAt: a.startsAt > new Date() ? new Date() : a.startsAt },
    include: { author: { select: { id: true, name: true, role: true } } },
  });
  await createAuditLog({
    communityId,
    userId: publisherId,
    action: "REGISTER",
    entityType: "ANNOUNCEMENT",
    entityId: announcementId,
    details: { title: a.title, action: "publish" },
  });
  return announced;
}

export async function unpublishAnnouncement(communityId: string, announcementId: string, publisherId: string) {
  const a = await db.announcement.findFirst({ where: { id: announcementId, communityId } });
  if (!a) throw new Error("Pengumuman tidak ditemukan");
  assertTransition(a.status, "DRAFT");
  const announced = await db.announcement.update({
    where: { id: announcementId },
    data: { status: "DRAFT", publishedAt: null },
    include: { author: { select: { id: true, name: true, role: true } } },
  });
  await createAuditLog({
    communityId,
    userId: publisherId,
    action: "REGISTER",
    entityType: "ANNOUNCEMENT",
    entityId: announcementId,
    details: { title: a.title, action: "unpublish" },
  });
  return announced;
}

export async function archiveAnnouncement(communityId: string, announcementId: string, publisherId: string) {
  const a = await db.announcement.findFirst({ where: { id: announcementId, communityId } });
  if (!a) throw new Error("Pengumuman tidak ditemukan");
  assertTransition(a.status, "ARCHIVED");
  const announced = await db.announcement.update({
    where: { id: announcementId },
    data: { status: "ARCHIVED" },
    include: { author: { select: { id: true, name: true, role: true } } },
  });
  await createAuditLog({
    communityId,
    userId: publisherId,
    action: "REGISTER",
    entityType: "ANNOUNCEMENT",
    entityId: announcementId,
    details: { title: a.title, action: "archive" },
  });
  return announced;
}

export async function expireAnnouncement(communityId: string, announcementId: string, actorId: string) {
  const a = await db.announcement.findFirst({ where: { id: announcementId, communityId } });
  if (!a) throw new Error("Pengumuman tidak ditemukan");
  assertTransition(a.status, "EXPIRED");
  const announced = await db.announcement.update({
    where: { id: announcementId },
    data: { status: "EXPIRED", expiresAt: new Date() },
  });
  await createAuditLog({
    communityId,
    userId: actorId,
    action: "REGISTER",
    entityType: "ANNOUNCEMENT",
    entityId: announcementId,
    details: { title: a.title, action: "expire" },
  });
  return announced;
}

export async function updateAnnouncement(
  communityId: string,
  announcementId: string,
  publisherId: string,
  data: {
    title?: string;
    content?: string;
    category?: string;
    priority?: string;
    audience?: string;
    startsAt?: string;
    expiresAt?: string;
    targetBlockIds?: string[];
    attachmentMeta?: unknown;
  },
) {
  const a = await db.announcement.findFirst({ where: { id: announcementId, communityId } });
  if (!a) throw new Error("Pengumuman tidak ditemukan");
  const updateData: Record<string, unknown> = {};
  if (data.title !== undefined) updateData.title = data.title;
  if (data.content !== undefined) updateData.content = data.content;
  if (data.category !== undefined) updateData.category = data.category;
  if (data.priority !== undefined) updateData.priority = data.priority;
  if (data.audience !== undefined) updateData.audience = data.audience;
  if (data.startsAt !== undefined) updateData.startsAt = new Date(data.startsAt);
  if (data.expiresAt !== undefined) updateData.expiresAt = data.expiresAt ? new Date(data.expiresAt) : null;
  if (data.targetBlockIds !== undefined) updateData.targetBlockIds = data.targetBlockIds;
  if (data.attachmentMeta !== undefined) updateData.attachmentMeta = data.attachmentMeta;
  const announced = await db.announcement.update({ where: { id: announcementId }, data: updateData });
  await createAuditLog({
    communityId,
    userId: publisherId,
    action: "REGISTER",
    entityType: "ANNOUNCEMENT",
    entityId: announcementId,
    details: { title: a.title, changes: Object.keys(updateData) },
  });
  return announced;
}

export async function markRead(announcementId: string, userId: string) {
  return db.announcementRead.upsert({
    where: { announcementId_userId: { announcementId, userId } },
    update: {},
    create: { announcementId, userId, readAt: new Date() },
  });
}

export async function getAnnouncementReadStatus(announcementId: string, userId: string) {
  return db.announcementRead.findFirst({ where: { announcementId, userId } });
}

export async function resolveViewerBlockId(userId: string, communityId: string): Promise<string | null> {
  const resident = await db.resident.findFirst({
    where: { userId, communityId, residentStatus: "ACTIVE" },
    include: { household: { include: { unit: true } } },
  });
  return resident?.household?.unit?.blockId ?? null;
}

export async function getResidentDashboard(communityId: string, userId: string, role: string) {
  const community = await db.community.findUnique({ where: { id: communityId } });
  const blockId = await resolveViewerBlockId(userId, communityId);
  const viewer: ViewerContext = { role, userId, communityId, blockId };

  const resident = await db.resident.findFirst({
    where: { userId, communityId, residentStatus: "ACTIVE" },
    include: {
      household: {
        include: {
          unit: { include: { block: true } },
          residents: { where: { residentStatus: "ACTIVE" } },
          documents: true,
        },
      },
    },
  });

  const { announcements } = await listAnnouncements(communityId, { limit: 10 }, viewer);
  const urgent = announcements.filter((a) => a.category === "EMERGENCY" || a.priority === "URGENT").slice(0, 3);
  const latest = announcements.slice(0, 5);

  const household = resident?.household ?? null;
  const docs = household?.documents ?? [];
  const docStats = {
    total: docs.length,
    verified: docs.filter((d: { status: string }) => d.status === "VERIFIED").length,
    pending: docs.filter((d: { status: string }) =>
      ["DRAFT", "SUBMITTED", "UNDER_REVIEW", "NEEDS_REVISION"].includes(d.status),
    ).length,
    rejected: docs.filter((d: { status: string }) => d.status === "REJECTED").length,
  };

  const activeReports = await db.report.count({
    where: {
      communityId,
      reporterId: userId,
      status: { in: ["NEW", "VERIFIED", "ASSIGNED", "IN_PROGRESS"] },
    },
  });

  const nextEvent = await db.event.findFirst({
    where: {
      communityId,
      status: "ACTIVE",
      startsAt: { gte: new Date() },
    },
    orderBy: { startsAt: "asc" },
  });

  const contacts = await db.importantContact.findMany({
    where: { communityId, visibility: "PUBLIC" },
    orderBy: { sortOrder: "asc" },
    take: 6,
  });

  const readIds = await db.announcementRead.findMany({
    where: { userId, announcementId: { in: latest.map((a) => a.id) } },
    select: { announcementId: true },
  });
  const readSet = new Set(readIds.map((r) => r.announcementId));

  return {
    community: community
      ? { id: community.id, name: community.name, branding: community.branding }
      : null,
    urgentAnnouncements: urgent,
    latestAnnouncements: latest.map((a) => ({ ...a, isRead: readSet.has(a.id) })),
    household: household
      ? {
          id: household.id,
          householdNumber: household.householdNumber,
          verificationStatus: household.verificationStatus,
          status: household.status,
          unit: household.unit,
          memberCount: household.residents.length,
          hasHead: Boolean(household.headResidentId),
          hasPrimaryContact: Boolean(household.primaryContactResidentId),
        }
      : null,
    documents: docStats,
    activeReports,
    nextEvent,
    contacts,
    quickLinks: [
      { label: "Keluarga saya", href: "/resident/household" },
      { label: "Pengumuman", href: "/resident/announcements" },
      { label: "Dokumen", href: "/documents" },
      { label: "Laporkan masalah", href: "/resident/reports" },
    ],
  };
}
