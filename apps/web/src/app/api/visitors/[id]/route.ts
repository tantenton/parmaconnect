import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookie } from "@/lib/auth/auth-service";
import { getVisitor, checkIn, checkOut, cancelVisit, approveVisit } from "@/lib/visitors/visitor-service";
import { z } from "zod";

function isStaff(role: string): boolean {
  return ["SUPER_ADMIN", "ADMIN", "STAFF"].includes(role);
}

function isAdmin(role: string): boolean {
  return ["SUPER_ADMIN", "ADMIN"].includes(role);
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSessionFromCookie();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const visitor = await getVisitor(session.communityId, id);
  if (!visitor) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ visitor });
}

const actionSchema = z.object({
  action: z.enum(["check_in", "check_out", "cancel", "approve"]),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSessionFromCookie();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = actionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validasi gagal", details: parsed.error.flatten() }, { status: 400 });
  }

  const { action } = parsed.data;

  try {
    switch (action) {
      case "check_in":
        if (!isStaff(session.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        return NextResponse.json({ visitor: await checkIn(session.communityId, id, session.userId) });

      case "check_out":
        if (!isStaff(session.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        return NextResponse.json({ visitor: await checkOut(session.communityId, id, session.userId) });

      case "approve":
        if (!isStaff(session.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        return NextResponse.json({ visitor: await approveVisit(session.communityId, id, session.userId) });

      case "cancel":
        // Resident cancels their own, or admin cancels any
        if (session.role === "RESIDENT") {
          return NextResponse.json({ visitor: await cancelVisit(session.communityId, id, session.userId) });
        }
        if (isAdmin(session.role)) {
          return NextResponse.json({ visitor: await cancelVisit(session.communityId, id, session.userId) });
        }
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}