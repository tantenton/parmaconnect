import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookie } from "@/lib/auth/auth-service";
import { createGovernanceRecord, listGovernanceRecords } from "@/lib/governance/governance-service";
import { z } from "zod";

const schema = z.object({
  title: z.string().min(3),
  content: z.string().min(10),
  type: z.enum(["MINUTES","DECISION","POLICY"]),
  effectiveDate: z.string().datetime(),
  visibility: z.enum(["PUBLIC","RESIDENTS_ONLY","STAFF_ONLY","ADMIN_ONLY"]).optional(),
});

export async function GET(req: NextRequest) {
  const session = await getSessionFromCookie();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || undefined;
  const type = searchParams.get("type") || undefined;
  const records = await listGovernanceRecords(session.communityId, session.role, search, type);
  return NextResponse.json({ records });
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromCookie();
  if (!session || !["SUPER_ADMIN","ADMIN"].includes(session.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Validasi gagal", details: parsed.error.flatten() }, { status: 400 });
  try {
    const record = await createGovernanceRecord(session.communityId, session.userId, {
      ...parsed.data,
      effectiveDate: new Date(parsed.data.effectiveDate),
    });
    return NextResponse.json({ record }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
