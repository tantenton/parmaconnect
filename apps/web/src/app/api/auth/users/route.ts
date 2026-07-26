import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookie, revokeAllUserSessions } from "@/lib/auth/auth-service";
import { createAuditLog } from "@/lib/auth/audit";
import { db } from "@/lib/db";
import { canManageRole } from "@/lib/auth/permissions";

const COMMUNITY_ID = "seed-community-parma";

// GET /api/auth/users - list users (admin only)
export async function GET(request: NextRequest) {
  const session = await getSessionFromCookie();
  if (!session || !["SUPER_ADMIN", "ADMIN"].includes(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "20");
  const role = searchParams.get("role");
  const status = searchParams.get("status");

  const where: Record<string, unknown> = { communityId: COMMUNITY_ID };
  if (role) where.role = role;
  if (status) where.status = status;

  const [users, total] = await Promise.all([
    db.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        lastLoginAt: true,
        emailVerified: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: (page - 1) * limit,
    }),
    db.user.count({ where }),
  ]);

  return NextResponse.json({ users, total, page, limit });
}

// PATCH /api/auth/users/[id] - update user (admin only)
export async function PATCH(request: NextRequest) {
  const session = await getSessionFromCookie();
  if (!session || !["SUPER_ADMIN", "ADMIN"].includes(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { userId, name, role, status } = body;

    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    const targetUser = await db.user.findUnique({ where: { id: userId } });
    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const ipAddress = request.headers.get("x-forwarded-for") ?? "unknown";
    const userAgent = request.headers.get("user-agent") ?? undefined;

    // Handle role change
    if (role && role !== targetUser.role) {
      if (!canManageRole(session.role, role)) {
        return NextResponse.json({ error: "Cannot assign this role" }, { status: 403 });
      }

      await db.user.update({
        where: { id: userId },
        data: { role },
      });

      // Revoke all sessions for this user so role takes effect
      await revokeAllUserSessions(userId);

      await createAuditLog({
        communityId: COMMUNITY_ID,
        userId: session.userId,
        action: "ROLE_CHANGE",
        entityType: "USER",
        entityId: userId,
        details: { from: targetUser.role, to: role },
        ipAddress,
        userAgent,
      });
    }

    // Handle status change
    if (status && status !== targetUser.status) {
      await db.user.update({
        where: { id: userId },
        data: { status },
      });

      // If disabling, revoke all sessions
      if (status === "DISABLED" || status === "SUSPENDED" || status === "INACTIVE") {
        await revokeAllUserSessions(userId);
      }

      const isDisable = status === "DISABLED" || status === "SUSPENDED" || status === "INACTIVE";

      await createAuditLog({
        communityId: COMMUNITY_ID,
        userId: session.userId,
        action: isDisable ? "ACCOUNT_DISABLE" : "ACCOUNT_ENABLE",
        entityType: "USER",
        entityId: userId,
        details: { from: targetUser.status, to: status },
        ipAddress,
        userAgent,
      });
    }

    // Handle name change
    if (name && name !== targetUser.name) {
      await db.user.update({
        where: { id: userId },
        data: { name },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("User update error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// DELETE /api/auth/users/[id] - delete user (super admin only)
export async function DELETE(request: NextRequest) {
  const session = await getSessionFromCookie();
  if (!session || session.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId || userId === session.userId) {
    return NextResponse.json({ error: "Cannot delete yourself" }, { status: 400 });
  }

  await revokeAllUserSessions(userId);
  await db.user.delete({ where: { id: userId } });

  await createAuditLog({
    communityId: COMMUNITY_ID,
    userId: session.userId,
    action: "USER_DELETE",
    entityType: "USER",
    entityId: userId,
    ipAddress: request.headers.get("x-forwarded-for") ?? "unknown",
    userAgent: request.headers.get("user-agent") ?? undefined,
  });

  return NextResponse.json({ success: true });
}