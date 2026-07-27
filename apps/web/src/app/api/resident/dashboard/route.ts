import { NextResponse } from "next/server";
import { getSessionFromCookie } from "@/lib/auth/auth-service";
import { getResidentDashboard } from "@/lib/announcements/announcement-service";

export async function GET() {
  const session = await getSessionFromCookie();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dashboard = await getResidentDashboard(session.communityId, session.userId, session.role);
  return NextResponse.json(dashboard);
}
