import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookie } from "@/lib/auth/auth-service";
import {
  getReport, verifyReport, rejectReport, markDuplicate, assignStaff,
  changePriority, closeReport, reopenReport, startWork, addProgress,
  resolveReport, cancelReport, filterTimelineForResident,
} from "@/lib/reports/report-service";
import { z } from "zod";

function isAdmin(role: string): boolean {
  return ["SUPER_ADMIN", "ADMIN"].includes(role);
}
function isStaff(role: string): boolean {
  return ["SUPER_ADMIN", "ADMIN", "STAFF"].includes(role);
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSessionFromCookie();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const report = await getReport(session.communityId, id, session.role, session.userId);
  if (!report) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Filter internal notes for residents
  if (session.role === "RESIDENT") {
    return NextResponse.json({
      report: {
        ...report,
        timeline: filterTimelineForResident(report.timeline as never),
      },
    });
  }

  return NextResponse.json({ report });
}

const actionSchema = z.object({
  action: z.enum(["verify", "reject", "duplicate", "assign", "priority", "close", "reopen", "start", "progress", "resolve", "cancel"]),
  notes: z.string().optional(),
  staffId: z.string().optional(),
  duplicateOfId: z.string().optional(),
  priority: z.string().optional(),
  resolution: z.string().optional(),
  isInternal: z.boolean().optional(),
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
  if (!parsed.success) return NextResponse.json({ error: "Validasi gagal", details: parsed.error.flatten() }, { status: 400 });

  const { action, notes, staffId, duplicateOfId, priority, resolution, isInternal } = parsed.data;

  try {
    switch (action) {
      case "verify":
        if (!isStaff(session.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        return NextResponse.json({ report: await verifyReport(session.communityId, id, session.userId, notes) });

      case "reject":
        if (!isStaff(session.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        return NextResponse.json({ report: await rejectReport(session.communityId, id, session.userId, notes) });

      case "duplicate":
        if (!isStaff(session.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        if (!duplicateOfId) return NextResponse.json({ error: "duplicateOfId diperlukan" }, { status: 400 });
        return NextResponse.json({ report: await markDuplicate(session.communityId, id, session.userId, duplicateOfId, notes) });

      case "assign":
        if (!isAdmin(session.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        if (!staffId) return NextResponse.json({ error: "staffId diperlukan" }, { status: 400 });
        return NextResponse.json({ report: await assignStaff(session.communityId, id, session.userId, staffId, notes) });

      case "priority":
        if (!isAdmin(session.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        if (!priority) return NextResponse.json({ error: "priority diperlukan" }, { status: 400 });
        return NextResponse.json({ report: await changePriority(session.communityId, id, session.userId, priority, notes) });

      case "close":
        if (!isAdmin(session.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        return NextResponse.json({ report: await closeReport(session.communityId, id, session.userId, notes) });

      case "reopen":
        if (!isAdmin(session.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        return NextResponse.json({ report: await reopenReport(session.communityId, id, session.userId, notes) });

      case "start":
        if (!isStaff(session.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        return NextResponse.json({ report: await startWork(session.communityId, id, session.userId, notes) });

      case "progress":
        if (!isStaff(session.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        if (!notes) return NextResponse.json({ error: "notes diperlukan" }, { status: 400 });
        return NextResponse.json({ timeline: await addProgress(session.communityId, id, session.userId, notes, isInternal) });

      case "resolve":
        if (!isStaff(session.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        if (!resolution) return NextResponse.json({ error: "resolution diperlukan" }, { status: 400 });
        return NextResponse.json({ report: await resolveReport(session.communityId, id, session.userId, resolution, notes) });

      case "cancel":
        return NextResponse.json({ report: await cancelReport(session.communityId, id, session.userId) });

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
