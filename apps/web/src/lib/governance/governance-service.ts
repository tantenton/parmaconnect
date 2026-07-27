import { db } from "@/lib/db";
import { createAuditLog } from "@/lib/auth/audit";

export async function createGovernanceRecord(communityId: string, adminId: string, data: {
  title: string; content: string; type: string; effectiveDate: Date; visibility?: string;
}) {
  const record = await db.governanceDocument.create({
    data: {
      communityId,
      title: data.title,
      content: data.content,
      type: data.type as never,
      effectiveDate: data.effectiveDate,
      visibility: (data.visibility ?? "RESIDENTS_ONLY") as never,
      approvalStatus: "DRAFT",
    },
  });
  await createAuditLog({ communityId, userId: adminId, action: "REGISTER", entityType: "GOVERNANCE", entityId: record.id, details: { title: data.title, type: data.type } });
  return record;
}

export async function publishGovernanceRecord(communityId: string, recordId: string, adminId: string) {
  const updated = await db.governanceDocument.update({
    where: { id: recordId },
    data: { approvalStatus: "APPROVED", publishedAt: new Date(), publishedById: adminId },
  });
  await createAuditLog({ communityId, userId: adminId, action: "REGISTER", entityType: "GOVERNANCE", entityId: recordId, details: { action: "publish" } });
  return updated;
}

export async function supersedeRecord(communityId: string, oldId: string, newId: string, adminId: string) {
  // Set old record's supersededById to new record, preserving history
  const old = await db.governanceDocument.findFirst({ where: { id: oldId, communityId } });
  if (!old) throw new Error("Record lama tidak ditemukan");
  const updated = await db.governanceDocument.update({
    where: { id: oldId },
    data: { supersededById: newId },
  });
  await db.governanceDocument.update({
    where: { id: newId },
    data: { revisionNumber: old.revisionNumber + 1 },
  });
  await createAuditLog({ communityId, userId: adminId, action: "REGISTER", entityType: "GOVERNANCE", entityId: oldId, details: { action: "supersede", newId } });
  return updated;
}

export async function listGovernanceRecords(communityId: string, role: string, search?: string, type?: string) {
  const where: Record<string, unknown> = { communityId };
  // Residents only see APPROVED + RESIDENTS visibility
  if (role === "RESIDENT") {
    where.approvalStatus = "APPROVED";
    where.visibility = "RESIDENTS_ONLY";
  } else if (role === "STAFF") {
    where.approvalStatus = "APPROVED";
    where.visibility = { in: ["RESIDENTS_ONLY", "STAFF_ONLY"] };
  }
  if (type) where.type = type;
  if (search) where.OR = [
    { title: { contains: search, mode: "insensitive" } },
    { content: { contains: search, mode: "insensitive" } },
  ];
  return db.governanceDocument.findMany({
    where,
    orderBy: { effectiveDate: "desc" },
    include: {
      publishedBy: { select: { id: true, name: true } },
      supersededBy: { select: { id: true, title: true } },
    },
  });
}

export async function getGovernanceRecord(communityId: string, recordId: string, role: string) {
  const record = await db.governanceDocument.findFirst({
    where: { id: recordId, communityId },
    include: {
      publishedBy: { select: { id: true, name: true } },
      supersededBy: { select: { id: true, title: true, effectiveDate: true } },
      supersedes: { select: { id: true, title: true, effectiveDate: true } },
    },
  });
  if (!record) return null;
  // Visibility check
  if (role === "RESIDENT" && (record.approvalStatus !== "APPROVED" || record.visibility !== "RESIDENTS_ONLY")) return null;
  if (role === "STAFF" && record.approvalStatus !== "APPROVED") return null;
  return record;
}
