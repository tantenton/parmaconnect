import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookie } from "@/lib/auth/auth-service";
import { getAuditLogs } from "@/lib/auth/audit";

export async function GET(request: NextRequest) {
  const session = await getSessionFromCookie();
  if (!session || !["SUPER_ADMIN", "ADMIN"].includes(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") ?? "50");
  const offset = parseInt(searchParams.get("offset") ?? "0");
  const action = searchParams.get("action") ?? undefined;
  const userId = searchParams.get("userId") ?? undefined;
  const entityType = searchParams.get("entityType") ?? undefined;

  const result = await getAuditLogs({
    communityId: session.communityId,
    limit,
    offset,
    action,
    userId,
    entityType,
  });

  return NextResponse.json(result);
}