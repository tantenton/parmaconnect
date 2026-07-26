import { db } from "@/lib/db";
import { logger } from "@/lib/logger";
import { Prisma } from "@/generated/prisma/client";

export type AuditAction =
  | "LOGIN"
  | "LOGIN_FAILED"
  | "LOGOUT"
  | "REGISTER"
  | "PASSWORD_RESET_REQUEST"
  | "PASSWORD_RESET_COMPLETE"
  | "ROLE_CHANGE"
  | "ACCOUNT_DISABLE"
  | "ACCOUNT_ENABLE"
  | "SESSION_REVOKE"
  | "USER_CREATE"
  | "USER_UPDATE"
  | "USER_DELETE"
  | "DOCUMENT_VIEW"
  | "DOCUMENT_UPLOAD"
  | "DOCUMENT_VERIFY"
  | "DOCUMENT_REJECT"
  | "SENSITIVE_EXPORT"
  | "BILLING_CHANGE"
  | "PAYMENT_CHANGE"
  | "REFUND"
  | "FINANCIAL_ADJUSTMENT"
  | "ADMIN_CHANGE"
  | "SECURITY_CONFIG_CHANGE";

export type AuditEntityType =
  | "USER"
  | "SESSION"
  | "RESIDENT"
  | "HOUSEHOLD"
  | "DOCUMENT"
  | "INVOICE"
  | "PAYMENT"
  | "COMMUNITY"
  | "REPORT"
  | "VEHICLE"
  | "VISITOR"
  | "EVENT"
  | "ANNOUNCEMENT";

export async function createAuditLog(params: {
  communityId: string;
  userId?: string;
  householdId?: string;
  action: AuditAction;
  entityType: AuditEntityType;
  entityId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}): Promise<void> {
  try {
    await db.auditLog.create({
      data: {
        communityId: params.communityId,
        userId: params.userId ?? null,
        householdId: params.householdId ?? null,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId ?? null,
        details: (params.details ?? Prisma.JsonNull) as Prisma.InputJsonValue,
        ipAddress: params.ipAddress ?? null,
        userAgent: params.userAgent ?? null,
      },
    });
  } catch (error) {
    // Audit log failures should not crash the application
    logger.error({ error, action: params.action }, "Failed to create audit log");
  }
}

export async function getAuditLogs(params: {
  communityId: string;
  limit?: number;
  offset?: number;
  action?: string;
  userId?: string;
  entityType?: string;
  fromDate?: Date;
  toDate?: Date;
}): Promise<{ logs: Array<Record<string, unknown>>; total: number }> {
  const where: Record<string, unknown> = {
    communityId: params.communityId,
  };

  if (params.action) where.action = params.action;
  if (params.userId) where.userId = params.userId;
  if (params.entityType) where.entityType = params.entityType;
  if (params.fromDate || params.toDate) {
    where.createdAt = {};
    if (params.fromDate) (where.createdAt as Record<string, unknown>).gte = params.fromDate;
    if (params.toDate) (where.createdAt as Record<string, unknown>).lte = params.toDate;
  }

  const [logs, total] = await Promise.all([
    db.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: params.limit ?? 50,
      skip: params.offset ?? 0,
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    }),
    db.auditLog.count({ where }),
  ]);

  return {
    logs: logs as unknown as Array<Record<string, unknown>>,
    total,
  };
}