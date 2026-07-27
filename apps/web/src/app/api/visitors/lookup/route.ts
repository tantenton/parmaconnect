import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookie } from "@/lib/auth/auth-service";
import { lookupByCode } from "@/lib/visitors/visitor-service";

export async function GET(req: NextRequest) {
  const session = await getSessionFromCookie();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!["SUPER_ADMIN", "ADMIN", "STAFF"].includes(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  if (!code) {
    return NextResponse.json({ error: "Parameter code diperlukan" }, { status: 400 });
  }

  const visitor = await lookupByCode(session.communityId, code.toUpperCase());
  if (!visitor) {
    return NextResponse.json({ error: "Kode tidak valid atau sudah kedaluwarsa" }, { status: 404 });
  }

  return NextResponse.json({ visitor });
}