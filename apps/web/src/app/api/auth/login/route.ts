import { NextRequest, NextResponse } from "next/server";
import { login, getSessionFromCookie } from "@/lib/auth/auth-service";
import { createAuditLog } from "@/lib/auth/audit";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email dan kata sandi diperlukan" },
        { status: 400 },
      );
    }

    const ipAddress = request.headers.get("x-forwarded-for") ?? "unknown";
    const userAgent = request.headers.get("user-agent") ?? undefined;

    const result = await login(email, password, ipAddress, userAgent);

    if (!result.success) {
      // Log failed login if user exists
      const existingUser = await (await import("@/lib/db")).db.user.findFirst({
        where: { email: email.toLowerCase().trim() },
        select: { id: true, communityId: true },
      });

      if (existingUser) {
        await createAuditLog({
          communityId: existingUser.communityId,
          userId: existingUser.id,
          action: "LOGIN_FAILED",
          entityType: "USER",
          entityId: existingUser.id,
          ipAddress,
          userAgent,
        });
      }

      return NextResponse.json({ error: result.error }, { status: 401 });
    }

    // Log successful login
    await createAuditLog({
      communityId: result.user.communityId,
      userId: result.user.id,
      action: "LOGIN",
      entityType: "USER",
      entityId: result.user.id,
      ipAddress,
      userAgent,
    });

    return NextResponse.json({
      user: result.user,
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}

export async function GET() {
  const session = await getSessionFromCookie();
  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const user = await (await import("@/lib/db")).db.user.findUnique({
    where: { id: session.userId },
    select: { id: true, name: true, email: true, role: true, status: true },
  });

  if (!user || user.status !== "ACTIVE") {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({ authenticated: true, user });
}