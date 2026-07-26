import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookie } from "@/lib/auth/auth-service";
import { verifyDocument, requestRevision, archiveDocument, getDocument } from "@/lib/documents/document-service";
import { db } from "@/lib/db";
import { createAuditLog } from "@/lib/auth/audit";
import { z } from "zod";

function isAdmin(role: string): boolean {
  return ["SUPER_ADMIN", "ADMIN", "DOCUMENT_ADMIN"].includes(role);
}

const verifySchema = z.object({
  action: z.enum(["VERIFIED", "REJECTED", "NEEDS_REVISION"]),
  reviewNotes: z.string().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSessionFromCookie();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isAdmin(session.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = verifySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Validasi gagal", details: parsed.error.flatten() }, { status: 400 });

  try {
    const doc = await verifyDocument(session.communityId, id, session.userId, parsed.data.action, parsed.data.reviewNotes, Object.fromEntries(req.headers.entries()));
    return NextResponse.json({ document: doc });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSessionFromCookie();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isAdmin(session.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  try {
    const doc = await archiveDocument(session.communityId, id, session.userId, Object.fromEntries(req.headers.entries()));
    return NextResponse.json({ document: doc });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSessionFromCookie();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isAdmin(session.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const notes = body?.notes ?? "Revisi diperlukan";

  try {
    const doc = await requestRevision(session.communityId, id, session.userId, notes, Object.fromEntries(req.headers.entries()));
    return NextResponse.json({ document: doc });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSessionFromCookie();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const householdId = searchParams.get("householdId")!;

  try {
    const doc = await getDocument(session.communityId, id, session.role, householdId);
    return NextResponse.json({ document: doc });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 403 });
  }
}