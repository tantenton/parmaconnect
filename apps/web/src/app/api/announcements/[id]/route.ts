import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookie } from "@/lib/auth/auth-service";
import {
  getAnnouncement,
  publishAnnouncement,
  unpublishAnnouncement,
  archiveAnnouncement,
  updateAnnouncement,
  expireAnnouncement,
  markRead,
  resolveViewerBlockId,
  type ViewerContext,
} from "@/lib/announcements/announcement-service";

function canManage(role: string): boolean {
  return ["SUPER_ADMIN", "ADMIN", "DOCUMENT_ADMIN", "STAFF"].includes(role);
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSessionFromCookie();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const blockId = await resolveViewerBlockId(session.userId, session.communityId);
  const viewer: ViewerContext = {
    role: session.role,
    userId: session.userId,
    communityId: session.communityId,
    blockId,
    forAdmin: canManage(session.role),
  };
  const a = await getAnnouncement(session.communityId, id, viewer);
  if (!a) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!canManage(session.role)) {
    await markRead(id, session.userId);
  }
  return NextResponse.json({ announcement: a });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSessionFromCookie();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!canManage(session.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  const body = await req.json().catch(() => null);

  try {
    if (body?.action === "publish") {
      const a = await publishAnnouncement(session.communityId, id, session.userId);
      return NextResponse.json({ announcement: a });
    }
    if (body?.action === "unpublish") {
      const a = await unpublishAnnouncement(session.communityId, id, session.userId);
      return NextResponse.json({ announcement: a });
    }
    if (body?.action === "archive") {
      const a = await archiveAnnouncement(session.communityId, id, session.userId);
      return NextResponse.json({ announcement: a });
    }
    if (body?.action === "expire") {
      const a = await expireAnnouncement(session.communityId, id, session.userId);
      return NextResponse.json({ announcement: a });
    }
    if (body?.action === "update" || body?.title || body?.content) {
      const a = await updateAnnouncement(session.communityId, id, session.userId, body.data ?? body);
      return NextResponse.json({ announcement: a });
    }
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
