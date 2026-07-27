import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookie } from "@/lib/auth/auth-service";
import {
  getPackage,
  notifyResident,
  markPickedUp,
  returnPackage,
} from "@/lib/packages/package-service";
import { z } from "zod";

function isSecurity(role: string): boolean {
  return ["SUPER_ADMIN", "ADMIN", "SECURITY_OFFICER"].includes(role);
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSessionFromCookie();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const pkg = await getPackage(session.communityId, id, session.role, session.userId);
  if (!pkg) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ package: pkg });
}

const actionSchema = z.object({
  action: z.enum(["notify", "pickup", "return"]),
  reason: z.string().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSessionFromCookie();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isSecurity(session.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = actionSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Validasi gagal", details: parsed.error.flatten() }, { status: 400 });

  const { action, reason } = parsed.data;

  try {
    switch (action) {
      case "notify":
        return NextResponse.json({ package: await notifyResident(session.communityId, id, session.userId) });
      case "pickup":
        return NextResponse.json({ package: await markPickedUp(session.communityId, id, session.userId) });
      case "return":
        return NextResponse.json({ package: await returnPackage(session.communityId, id, session.userId, reason) });
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}