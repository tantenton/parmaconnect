import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookie } from "@/lib/auth/auth-service";
import {
  listAnnouncements,
  createAnnouncement,
  resolveViewerBlockId,
  type ViewerContext,
} from "@/lib/announcements/announcement-service";
import { isAdminRole } from "@/lib/auth/permissions";

function canManage(role: string): boolean {
  return ["SUPER_ADMIN", "ADMIN", "DOCUMENT_ADMIN", "STAFF"].includes(role);
}

export async function GET(req: NextRequest) {
  const session = await getSessionFromCookie();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category") || undefined;
  const status = searchParams.get("status") || undefined;
  const priority = searchParams.get("priority") || undefined;
  const search = searchParams.get("search") || undefined;
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const adminView = searchParams.get("admin") === "1" && canManage(session.role);

  const blockId = await resolveViewerBlockId(session.userId, session.communityId);
  const viewer: ViewerContext = {
    role: session.role,
    userId: session.userId,
    communityId: session.communityId,
    blockId,
    forAdmin: adminView,
  };

  const result = await listAnnouncements(
    session.communityId,
    { category, status, priority, search, page, limit, includeHidden: adminView },
    viewer,
  );
  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromCookie();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!canManage(session.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json().catch(() => null);
  if (!body?.title || !body?.content) {
    return NextResponse.json({ error: "title dan content diperlukan" }, { status: 400 });
  }

  try {
    const announcement = await createAnnouncement(session.communityId, session.userId, {
      title: body.title,
      content: body.content,
      category: body.category ?? "GENERAL",
      priority: body.priority ?? "NORMAL",
      audience: body.audience ?? "ALL",
      startsAt: body.startsAt,
      expiresAt: body.expiresAt,
      targetBlockIds: body.targetBlockIds,
      attachmentMeta: body.attachmentMeta,
      schedule: body.schedule === true,
    });
    return NextResponse.json({ announcement }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
