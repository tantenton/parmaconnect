import { db } from "@/lib/db";
import { createAuditLog } from "@/lib/auth/audit";

// ── Transition policy ──────────────────────────────────────────────
const TRANSITIONS: Record<string, string[]> = {
  NEW: ["VERIFIED", "REJECTED", "DUPLICATE", "CLOSED"],
  VERIFIED: ["ASSIGNED", "REJECTED", "DUPLICATE", "CLOSED"],
  ASSIGNED: ["IN_PROGRESS", "REJECTED", "DUPLICATE", "CLOSED", "NEW"],
  IN_PROGRESS: ["RESOLVED", "CLOSED", "ASSIGNED"],
  RESOLVED: ["CLOSED", "IN_PROGRESS"],
  CLOSED: ["IN_PROGRESS"],
  REJECTED: ["NEW", "CLOSED"],
  DUPLICATE: ["NEW", "CLOSED"],
};

export function assertTransition(from: string, to: string): void {
  const allowed = TRANSITIONS[from] ?? [];
  if (!allowed.includes(to)) throw new Error(`Tidak dapat transit dari ${from} ke ${to}`);
}

// ── Permission helpers ─────────────────────────────────────────────
function isAdmin(role: string): boolean {
  return ["SUPER_ADMIN", "ADMIN"].includes(role);
}
function isStaff(role: string): boolean {
  return ["SUPER_ADMIN", "ADMIN", "STAFF"].includes(role);
}

// ── Create report ──────────────────────────────────────────────────
export async function createReport(
  communityId: string,
  reporterId: string,
  data: {
    title: string;
    description: string;
    category: string;
    location?: string;
    priority?: string;
    isPublic?: boolean;
  },
) {
  const report = await db.report.create({
    data: {
      communityId,
      title: data.title,
      description: data.description,
      category: data.category as never,
      location: data.location ?? null,
      priority: (data.priority ?? "MEDIUM") as never,
      status: "NEW",
      reporterId,
      isPublic: data.isPublic ?? false,
    },
    include: { reporter: { select: { id: true, name: true, role: true } } },
  });

  await db.reportTimeline.create({
    data: {
      reportId: report.id,
      action: "REPORT_CREATED",
      performedById: reporterId,
    },
  });

  await createAuditLog({
    communityId,
    userId: reporterId,
    action: "REGISTER",
    entityType: "REPORT",
    entityId: report.id,
    details: { title: data.title, category: data.category },
  });

  return report;
}

// ── List reports ───────────────────────────────────────────────────
export async function listReports(
  communityId: string,
  params: {
    status?: string;
    category?: string;
    priority?: string;
    reporterId?: string;
    assignedStaffId?: string;
    search?: string;
    page?: number;
    limit?: number;
  } = {},
) {
  const where: Record<string, unknown> = { communityId };
  if (params.status) where.status = params.status;
  if (params.category) where.category = params.category;
  if (params.priority) where.priority = params.priority;
  if (params.reporterId) where.reporterId = params.reporterId;
  if (params.assignedStaffId) where.assignedStaffId = params.assignedStaffId;
  if (params.search) {
    where.OR = [
      { title: { contains: params.search, mode: "insensitive" } },
      { description: { contains: params.search, mode: "insensitive" } },
    ];
  }
  const page = params.page ?? 1;
  const limit = params.limit ?? 20;
  const [reports, total] = await Promise.all([
    db.report.findMany({
      where,
      include: {
        reporter: { select: { id: true, name: true, role: true } },
        assignedStaff: { select: { id: true, name: true, role: true } },
        _count: { select: { timeline: true } },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: (page - 1) * limit,
    }),
    db.report.count({ where }),
  ]);
  return { reports, total, page, limit };
}

// ── Get report detail ──────────────────────────────────────────────
export async function getReport(
  communityId: string,
  reportId: string,
  viewerRole: string,
  viewerUserId: string,
) {
  const report = await db.report.findFirst({
    where: { id: reportId, communityId },
    include: {
      reporter: { select: { id: true, name: true, role: true } },
      assignedStaff: { select: { id: true, name: true, role: true } },
      timeline: {
        include: { performedBy: { select: { id: true, name: true, role: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  });
  if (!report) return null;

  // Resident: only own reports or public reports
  if (viewerRole === "RESIDENT") {
    if (report.reporterId !== viewerUserId && !report.isPublic) return null;
  }

  // Staff: only assigned reports (unless admin)
  if (viewerRole === "STAFF" && !isAdmin(viewerRole)) {
    if (report.assignedStaffId !== viewerUserId && report.status === "NEW") {
      // Staff can see NEW reports only if explicitly assigned
      return null;
    }
  }

  return report;
}

// ── Admin actions ──────────────────────────────────────────────────
export async function verifyReport(communityId: string, reportId: string, adminId: string, notes?: string) {
  const report = await db.report.findFirst({ where: { id: reportId, communityId } });
  if (!report) throw new Error("Laporan tidak ditemukan");
  assertTransition(report.status, "VERIFIED");
  const updated = await db.report.update({
    where: { id: reportId },
    data: { status: "VERIFIED" },
  });
  await db.reportTimeline.create({
    data: { reportId, action: "VERIFIED", performedById: adminId, notes },
  });
  await createAuditLog({ communityId, userId: adminId, action: "REGISTER", entityType: "REPORT", entityId: reportId, details: { action: "verify" } });
  return updated;
}

export async function rejectReport(communityId: string, reportId: string, adminId: string, notes?: string) {
  const report = await db.report.findFirst({ where: { id: reportId, communityId } });
  if (!report) throw new Error("Laporan tidak ditemukan");
  assertTransition(report.status, "REJECTED");
  const updated = await db.report.update({
    where: { id: reportId },
    data: { status: "REJECTED" },
  });
  await db.reportTimeline.create({
    data: { reportId, action: "REJECTED", performedById: adminId, notes },
  });
  await createAuditLog({ communityId, userId: adminId, action: "REGISTER", entityType: "REPORT", entityId: reportId, details: { action: "reject" } });
  return updated;
}

export async function markDuplicate(communityId: string, reportId: string, adminId: string, duplicateOfId: string, notes?: string) {
  const report = await db.report.findFirst({ where: { id: reportId, communityId } });
  if (!report) throw new Error("Laporan tidak ditemukan");
  assertTransition(report.status, "DUPLICATE");
  const updated = await db.report.update({
    where: { id: reportId },
    data: { status: "DUPLICATE" },
  });
  await db.reportTimeline.create({
    data: { reportId, action: "DUPLICATE_MARKED", performedById: adminId, notes: `Duplikat dari ${duplicateOfId}. ${notes ?? ""}` },
  });
  await createAuditLog({ communityId, userId: adminId, action: "REGISTER", entityType: "REPORT", entityId: reportId, details: { action: "duplicate", duplicateOfId } });
  return updated;
}

export async function assignStaff(communityId: string, reportId: string, adminId: string, staffId: string, notes?: string) {
  const report = await db.report.findFirst({ where: { id: reportId, communityId } });
  if (!report) throw new Error("Laporan tidak ditemukan");
  assertTransition(report.status, "ASSIGNED");
  const updated = await db.report.update({
    where: { id: reportId },
    data: { status: "ASSIGNED", assignedStaffId: staffId },
  });
  await db.reportTimeline.create({
    data: { reportId, action: "ASSIGNED", performedById: adminId, notes: `Ditugaskan ke staff. ${notes ?? ""}` },
  });
  await createAuditLog({ communityId, userId: adminId, action: "REGISTER", entityType: "REPORT", entityId: reportId, details: { action: "assign", staffId } });
  return updated;
}

export async function changePriority(communityId: string, reportId: string, adminId: string, priority: string, notes?: string) {
  const report = await db.report.findFirst({ where: { id: reportId, communityId } });
  if (!report) throw new Error("Laporan tidak ditemukan");
  const updated = await db.report.update({
    where: { id: reportId },
    data: { priority: priority as never },
  });
  await db.reportTimeline.create({
    data: { reportId, action: "PRIORITY_CHANGED", performedById: adminId, notes: `Prioritas diubah ke ${priority}. ${notes ?? ""}` },
  });
  return updated;
}

export async function closeReport(communityId: string, reportId: string, adminId: string, notes?: string) {
  const report = await db.report.findFirst({ where: { id: reportId, communityId } });
  if (!report) throw new Error("Laporan tidak ditemukan");
  assertTransition(report.status, "CLOSED");
  const updated = await db.report.update({
    where: { id: reportId },
    data: { status: "CLOSED", closedAt: new Date() },
  });
  await db.reportTimeline.create({
    data: { reportId, action: "CLOSED", performedById: adminId, notes },
  });
  await createAuditLog({ communityId, userId: adminId, action: "REGISTER", entityType: "REPORT", entityId: reportId, details: { action: "close" } });
  return updated;
}

export async function reopenReport(communityId: string, reportId: string, adminId: string, notes?: string) {
  const report = await db.report.findFirst({ where: { id: reportId, communityId } });
  if (!report) throw new Error("Laporan tidak ditemukan");
  assertTransition(report.status, "IN_PROGRESS");
  const updated = await db.report.update({
    where: { id: reportId },
    data: { status: "IN_PROGRESS", closedAt: null },
  });
  await db.reportTimeline.create({
    data: { reportId, action: "REOPENED", performedById: adminId, notes },
  });
  await createAuditLog({ communityId, userId: adminId, action: "REGISTER", entityType: "REPORT", entityId: reportId, details: { action: "reopen" } });
  return updated;
}

// ── Staff actions ──────────────────────────────────────────────────
export async function startWork(communityId: string, reportId: string, staffId: string, notes?: string) {
  const report = await db.report.findFirst({ where: { id: reportId, communityId } });
  if (!report) throw new Error("Laporan tidak ditemukan");
  if (report.assignedStaffId !== staffId && !isAdmin(staffId)) {
    const user = await db.user.findUnique({ where: { id: staffId } });
    if (!user || !isAdmin(user.role)) throw new Error("Tidak diizinkan: bukan staff yang ditugaskan");
  }
  assertTransition(report.status, "IN_PROGRESS");
  const updated = await db.report.update({
    where: { id: reportId },
    data: { status: "IN_PROGRESS" },
  });
  await db.reportTimeline.create({
    data: { reportId, action: "WORK_STARTED", performedById: staffId, notes },
  });
  await createAuditLog({ communityId, userId: staffId, action: "REGISTER", entityType: "REPORT", entityId: reportId, details: { action: "start_work" } });
  return updated;
}

export async function addProgress(communityId: string, reportId: string, staffId: string, notes: string, isInternal: boolean = false) {
  const report = await db.report.findFirst({ where: { id: reportId, communityId } });
  if (!report) throw new Error("Laporan tidak ditemukan");
  if (report.assignedStaffId !== staffId) {
    const user = await db.user.findUnique({ where: { id: staffId } });
    if (!user || !isAdmin(user.role)) throw new Error("Tidak diizinkan: bukan staff yang ditugaskan");
  }
  const timelineEntry = await db.reportTimeline.create({
    data: {
      reportId,
      action: isInternal ? "INTERNAL_NOTE" : "PROGRESS_ADDED",
      performedById: staffId,
      notes,
    },
  });
  return timelineEntry;
}

export async function resolveReport(communityId: string, reportId: string, staffId: string, resolution: string, notes?: string) {
  const report = await db.report.findFirst({ where: { id: reportId, communityId } });
  if (!report) throw new Error("Laporan tidak ditemukan");
  if (report.assignedStaffId !== staffId) {
    const user = await db.user.findUnique({ where: { id: staffId } });
    if (!user || !isAdmin(user.role)) throw new Error("Tidak diizinkan: bukan staff yang ditugaskan");
  }
  assertTransition(report.status, "RESOLVED");
  const updated = await db.report.update({
    where: { id: reportId },
    data: { status: "RESOLVED", resolution, resolvedAt: new Date() },
  });
  await db.reportTimeline.create({
    data: { reportId, action: "RESOLVED", performedById: staffId, notes: `Resolusi: ${resolution}. ${notes ?? ""}` },
  });
  await createAuditLog({ communityId, userId: staffId, action: "REGISTER", entityType: "REPORT", entityId: reportId, details: { action: "resolve" } });
  return updated;
}

// ── Resident actions ───────────────────────────────────────────────
export async function cancelReport(communityId: string, reportId: string, reporterId: string) {
  const report = await db.report.findFirst({ where: { id: reportId, communityId } });
  if (!report) throw new Error("Laporan tidak ditemukan");
  if (report.reporterId !== reporterId) throw new Error("Tidak diizinkan: bukan pemilik laporan");
  if (report.status !== "NEW") throw new Error("Hanya laporan baru yang dapat dibatalkan");
  const updated = await db.report.update({
    where: { id: reportId },
    data: { status: "CLOSED", closedAt: new Date() },
  });
  await db.reportTimeline.create({
    data: { reportId, action: "CANCELLED", performedById: reporterId, notes: "Dibatalkan oleh pelapor" },
  });
  return updated;
}

// ── Filter timeline for residents ──────────────────────────────────
export function filterTimelineForResident(
  timeline: Array<{ action: string; notes: string | null; performedBy: { id: string; name: string | null; role: string } }>,
) {
  return timeline.filter((t) => t.action !== "INTERNAL_NOTE");
}
