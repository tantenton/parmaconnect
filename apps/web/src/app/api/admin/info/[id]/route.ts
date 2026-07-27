import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookie } from "@/lib/auth/auth-service";
import { publishInfoPage, archiveInfoPage } from "@/lib/info-pages/info-page-service";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionFromCookie();
  if (!session || !["SUPER_ADMIN","ADMIN"].includes(session.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  const body = await req.json().catch(() => null);
  try {
    if (body.action === "publish") return NextResponse.json({ page: await publishInfoPage(session.communityId, id, session.userId) });
    if (body.action === "archive") return NextResponse.json({ page: await archiveInfoPage(session.communityId, id, session.userId) });
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
