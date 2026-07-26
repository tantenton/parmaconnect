import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookie } from "@/lib/auth/auth-service";
import { addResident } from "@/lib/household/household-service";
import { z } from "zod";

const addSchema = z.object({
  fullName: z.string().min(1).max(200),
  familyRelationship: z.string().min(1).max(50),
  phone: z.string().max(30).optional(),
  email: z.string().email().max(200).optional(),
  moveInDate: z.string().optional(),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionFromCookie();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!["SUPER_ADMIN", "ADMIN"].includes(session.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id: householdId } = await params;
  const body = await req.json().catch(() => null);
  const parsed = addSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Validasi gagal", details: parsed.error.flatten() }, { status: 400 });
  try {
    const resident = await addResident({ userId: session.userId, communityId: session.communityId, role: session.role }, householdId, parsed.data, Object.fromEntries(req.headers.entries()));
    return NextResponse.json({ resident }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
