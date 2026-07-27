import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookie } from "@/lib/auth/auth-service";
import { createReport, listReports } from "@/lib/reports/report-service";
import { z } from "zod";

const createSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(5),
  category: z.enum(["SECURITY", "WASTE", "STREET_LIGHT", "DRAINAGE", "ROAD", "COMMON_FACILITY", "NOISE", "ANIMAL", "OTHER"]),
  location: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  isPublic: z.boolean().optional(),
});

export async function GET(req: NextRequest) {
  const session = await getSessionFromCookie();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || undefined;
  const category = searchParams.get("category") || undefined;
  const priority = searchParams.get("priority") || undefined;
  const search = searchParams.get("search") || undefined;
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");

  // Residents see only their own reports
  const reporterId = session.role === "RESIDENT" ? session.userId : (searchParams.get("reporterId") || undefined);
  // Staff see only assigned reports (unless admin)
  const assignedStaffId = session.role === "STAFF" ? session.userId : (searchParams.get("assignedStaffId") || undefined);

  const result = await listReports(session.communityId, { status, category, priority, reporterId, assignedStaffId, search, page, limit });
  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromCookie();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Validasi gagal", details: parsed.error.flatten() }, { status: 400 });

  try {
    const report = await createReport(session.communityId, session.userId, parsed.data);
    return NextResponse.json({ report }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
