import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookie } from "@/lib/auth/auth-service";
import { listInfoPages } from "@/lib/info-pages/info-page-service";

export async function GET(req: NextRequest) {
  const session = await getSessionFromCookie();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || undefined;
  const pages = await listInfoPages(session.communityId, session.role, search);
  return NextResponse.json({ pages });
}
