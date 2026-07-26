import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookie } from "@/lib/auth/auth-service";
import { uploadDocument, listDocuments, getDocument, verifyDocument, requestRevision, archiveDocument, generateStorageKey } from "@/lib/documents/document-service";
import { db } from "@/lib/db";
import { createAuditLog } from "@/lib/auth/audit";
import { z } from "zod";

const uploadSchema = z.object({
  householdId: z.string().min(1),
  documentType: z.enum(["FAMILY_CARD", "IDENTITY_CARD", "LEASE_AGREEMENT", "RESIDENT_CONSENT", "VEHICLE_DOCUMENT", "OTHER"]),
});

function isAdmin(role: string): boolean {
  return ["SUPER_ADMIN", "ADMIN"].includes(role);
}
function isDocAdmin(role: string): boolean {
  return ["SUPER_ADMIN", "ADMIN", "DOCUMENT_ADMIN"].includes(role);
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromCookie();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isDocAdmin(session.role) && session.role !== "RESIDENT") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const meta = formData.get("meta") as string | null;

  if (!file) return NextResponse.json({ error: "File diperlukan" }, { status: 400 });

  const metaParsed = meta ? JSON.parse(meta as string) : {};
  const params = uploadSchema.safeParse(metaParsed);
  if (!params.success) return NextResponse.json({ error: "Validasi gagal", details: params.error.flatten() }, { status: 400 });

  // Check household access
  const household = await db.household.findUnique({ where: { id: params.data.householdId } });
  if (!household || household.communityId !== session.communityId) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (session.role === "RESIDENT") {
    const resident = await db.resident.findUnique({ where: { userId: session.userId } });
    if (!resident || resident.householdId !== household.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const key = generateStorageKey();

  const doc = await uploadDocument(
    {
      communityId: session.communityId,
      householdId: params.data.householdId,
      documentType: params.data.documentType,
      storageKey: key,
      originalFilename: file.name,
      mimeType: file.type || "application/octet-stream",
      sizeBytes: buffer.length,
      checksum: "pending",
      submittedById: session.userId,
      status: "DRAFT",
    },
    Object.fromEntries(req.headers.entries()),
  );

  return NextResponse.json({ document: doc }, { status: 201 });
}

export async function GET(req: NextRequest) {
  const session = await getSessionFromCookie();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const householdId = searchParams.get("householdId")!;
  const documentType = searchParams.get("documentType") || undefined;
  const status = searchParams.get("status") || undefined;
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");

  if (!householdId) return NextResponse.json({ error: "householdId diperlukan" }, { status: 400 });

  const household = await db.household.findUnique({ where: { id: householdId } });
  if (!household || household.communityId !== session.communityId) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Role-based household access
  if (session.role === "RESIDENT") {
    const resident = await db.resident.findUnique({ where: { userId: session.userId } });
    if (!resident || resident.householdId !== household.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const result = await listDocuments(session.communityId, householdId, { documentType, status, page, limit });
  return NextResponse.json(result);
}
