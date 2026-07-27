import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookie } from "@/lib/auth/auth-service";
import { createContact, listContacts } from "@/lib/contacts/contact-service";
import { z } from "zod";

const schema = z.object({
  category: z.enum(["SECURITY","MANAGEMENT","CLEANING","TECHNICIAN","AMBULANCE","POLICE","FIRE_DEPARTMENT","OTHER"]),
  name: z.string().min(2),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  availability: z.string().optional(),
  visibility: z.enum(["PUBLIC","RESIDENTS_ONLY","STAFF_ONLY","ADMIN_ONLY"]).optional(),
  sortOrder: z.number().optional(),
});

export async function GET() {
  const session = await getSessionFromCookie();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const contacts = await listContacts(session.communityId, session.role);
  return NextResponse.json({ contacts });
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromCookie();
  if (!session || !["SUPER_ADMIN","ADMIN"].includes(session.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Validasi gagal", details: parsed.error.flatten() }, { status: 400 });
  try {
    const contact = await createContact(session.communityId, session.userId, parsed.data);
    return NextResponse.json({ contact }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
