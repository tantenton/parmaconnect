import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookie } from "@/lib/auth/auth-service";
import { createInfoPage, listInfoPages } from "@/lib/info-pages/info-page-service";
import { z } from "zod";

const schema = z.object({
  title: z.string().min(3),
  content: z.string().min(10),
  category: z.string().optional(),
  slug: z.string().optional(),
  visibility: z.enum(["PUBLIC","RESIDENTS_ONLY","STAFF_ONLY","ADMIN_ONLY"]).optional(),
  effectiveDate: z.string().datetime().optional(),
});

export async function GET(req: NextRequest) {
  const session = await getSessionFromCookie();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || undefined;
  const pages = await listInfoPages(session.communityId, session.role, search);
  return NextResponse.json({ pages });
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromCookie();
  if (!session || !["SUPER_ADMIN","ADMIN"].includes(session.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Validasi gagal", details: parsed.error.flatten() }, { status: 400 });
  try {
    const page = await createInfoPage(session.communityId, session.userId, {
      ...parsed.data,
      effectiveDate: parsed.data.effectiveDate ? new Date(parsed.data.effectiveDate) : undefined,
    });
    return NextResponse.json({ page }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
