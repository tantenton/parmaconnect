import { randomBytes } from "crypto";
import { db } from "@/lib/db";
import { createAuditLog } from "@/lib/auth/audit";

export const ALLOWED_MIME_TYPES = [
  "application/pdf", "image/jpeg", "image/png", "image/webp",
  "text/plain", "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/json", "text/csv",
];

export const ALLOWED_EXTENSIONS = [
  ".pdf", ".jpg", ".jpeg", ".png", ".webp", ".txt", ".doc", ".docx", ".xls", ".xlsx", ".csv", ".json",
];
export const MAX_FILE_SIZE = 10 * 1024 * 1024;
export const STORAGE_DIR = process.env.DOC_STORAGE_DIR || "/tmp/parmaconnect-uploads";

export const malwareScanner = async (_buffer: Buffer, _mimeType: string): Promise<boolean> => true;

export function generateStorageKey(): string {
  return `${Date.now()}-${randomBytes(16).toString("hex")}`;
}

export function assertTransition(from: string, to: string): void {
  const transitions: Record<string, string[]> = {
    DRAFT: ["SUBMITTED", "REJECTED"], SUBMITTED: ["UNDER_REVIEW", "REJECTED"],
    UNDER_REVIEW: ["NEEDS_REVISION", "VERIFIED", "REJECTED"], NEEDS_REVISION: ["SUBMITTED", "REJECTED"],
    VERIFIED: ["ARCHIVED", "EXPIRED"], REJECTED: ["DRAFT"], ARCHIVED: [], EXPIRED: [],
  };
  if (!(transitions[from] ?? []).includes(to)) throw new Error(`Tidak transit dari ${from} ke ${to}`);
}

export async function uploadDocument(
  params: {
    communityId: string; householdId?: string; residentId?: string;
    documentType: string; storageKey: string; originalFilename: string;
    mimeType: string; sizeBytes: number; checksum: string; submittedById: string; status?: string; version?: number;
  },
  headers: Record<string, string>,
) {
  if (!ALLOWED_MIME_TYPES.includes(params.mimeType)) throw new Error("MIME tidak diizinkan");
  if (params.sizeBytes > MAX_FILE_SIZE) throw new Error("Ukuran file melebihi batas");
  const ext = "." + (params.originalFilename.split(".").pop() ?? "").toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) throw new Error("Ekstensi tidak diizinkan");

  const doc = await db.residentDocument.upsert({
    where: { storageKey: params.storageKey },
    update: {},
    create: {
      communityId: params.communityId, householdId: params.householdId ?? null, residentId: params.residentId ?? null,
      documentType: params.documentType as never, storageKey: params.storageKey,
      originalFilename: params.originalFilename, mimeType: params.mimeType, sizeBytes: params.sizeBytes,
      checksum: params.checksum, version: params.version ?? 1, status: (params.status ?? "DRAFT") as never,
      submittedById: params.submittedById,
    },
  });

  await createAuditLog({
    communityId: params.communityId, userId: params.submittedById, action: "DOCUMENT_UPLOAD", entityType: "DOCUMENT", entityId: doc.id,
    details: { documentType: params.documentType, originalFilename: params.originalFilename, mimeType: params.mimeType, sizeBytes: params.sizeBytes },
    ipAddress: headers["x-forwarded-for"]?.split(",")[0]?.trim() ?? headers["x-real-ip"],
  });
  return doc;
}

export async function listDocuments(communityId: string, householdId: string, filters: { documentType?: string; status?: string; page?: number; limit?: number } = {}) {
  const where: Record<string, unknown> = { communityId, householdId };
  if (filters.documentType) where.documentType = filters.documentType;
  if (filters.status) where.status = filters.status;
  const page = filters.page ?? 1; const limit = filters.limit ?? 20;
  const [docs, total] = await Promise.all([
    db.residentDocument.findMany({ where, orderBy: { createdAt: "desc" }, take: limit, skip: (page - 1) * limit }),
    db.residentDocument.count({ where }),
  ]);
  return { documents: docs, total, page, limit };
}

export async function getDocument(communityId: string, documentId: string, requesterRole: string, requesterHouseholdId?: string) {
  const doc = await db.residentDocument.findUnique({ where: { id: documentId } });
  if (!doc || doc.communityId !== communityId) throw new Error("Dokument tidak ditemukan");
  if (requesterRole === "RESIDENT" && doc.householdId !== requesterHouseholdId) throw new Error("Tidak diizinkan");
  if (requesterRole === "SECURITY_OFFICER" && ["FAMILY_CARD", "IDENTITY_CARD"].includes(doc.documentType)) throw new Error("Tidak diizinkan");
  if (requesterRole === "FINANCE_ADMIN" && ["FAMILY_CARD", "IDENTITY_CARD"].includes(doc.documentType)) throw new Error("Tidak diizinkan");
  return doc;
}

export async function verifyDocument(communityId: string, documentId: string, verifierId: string, action: "VERIFIED" | "REJECTED" | "NEEDS_REVISION", reviewNotes?: string, headers?: Record<string, string>) {
  const doc = await db.residentDocument.findUnique({ where: { id: documentId } });
  if (!doc || doc.communityId !== communityId) throw new Error("Dokument tidak ditemukan");
  if (["FAMILY_CARD", "IDENTITY_CARD"].includes(doc.documentType)) {
    const verifier = await db.user.findUnique({ where: { id: verifierId } });
    if (verifier?.role === "SECURITY_OFFICER" || verifier?.role === "FINANCE_ADMIN") throw new Error("Peran tidak diizinkan untuk tipe dokumen ini");
  }
  assertTransition(doc.status, action);
  const updated = await db.residentDocument.update({ where: { id: documentId }, data: { status: action as never, verifiedById: action === "VERIFIED" ? verifierId : null, reviewNotes: reviewNotes ?? doc.reviewNotes } });
  await createAuditLog({ communityId, userId: verifierId, action: "DOCUMENT_VERIFY", entityType: "DOCUMENT", entityId: documentId, details: { documentType: doc.documentType, action, reviewNotes }, ipAddress: headers?.["x-forwarded-for"]?.split(",")[0]?.trim() });
  return updated;
}

export async function requestRevision(communityId: string, documentId: string, reviewerId: string, notes: string, headers?: Record<string, string>) {
  const doc = await db.residentDocument.findUnique({ where: { id: documentId } });
  if (!doc || doc.communityId !== communityId) throw new Error("Dokument tidak ditemukan");
  assertTransition(doc.status, "NEEDS_REVISION");
  const updated = await db.residentDocument.update({ where: { id: documentId }, data: { status: "NEEDS_REVISION", reviewNotes: notes } });
  await createAuditLog({ communityId, userId: reviewerId, action: "DOCUMENT_VERIFY", entityType: "DOCUMENT", entityId: documentId, details: { documentType: doc.documentType, action: "NEEDS_REVISION", notes }, ipAddress: headers?.["x-forwarded-for"]?.split(",")[0]?.trim() });
  return updated;
}

export async function archiveDocument(communityId: string, documentId: string, archiverId: string, headers?: Record<string, string>) {
  const doc = await db.residentDocument.findUnique({ where: { id: documentId } });
  if (!doc || doc.communityId !== communityId) throw new Error("Dokument tidak ditemukan");
  assertTransition(doc.status, "ARCHIVED");
  const updated = await db.residentDocument.update({ where: { id: documentId }, data: { status: "ARCHIVED", archivedAt: new Date() } });
  await createAuditLog({ communityId, userId: archiverId, action: "DOCUMENT_VERIFY", entityType: "DOCUMENT", entityId: documentId, details: { documentType: doc.documentType, action: "ARCHIVED" }, ipAddress: headers?.["x-forwarded-for"]?.split(",")[0]?.trim() });
  return updated;
}
