import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookie } from "@/lib/auth/auth-service";
import { listContacts } from "@/lib/contacts/contact-service";

export async function GET() {
  const session = await getSessionFromCookie();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const contacts = await listContacts(session.communityId, session.role);
  return NextResponse.json({ contacts });
}
