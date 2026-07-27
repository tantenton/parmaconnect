import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookie } from "@/lib/auth/auth-service";
import { createVisitor, listActive, listByHousehold } from "@/lib/visitors/visitor-service";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().min(1),
  licensePlate: z.string().optional(),
  destinationUnitId: z.string().optional(),
  validFrom: z.string().datetime(),
  validUntil: z.string().datetime(),
});

export async function GET(req: NextRequest) {
  const session = await getSessionFromCookie();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Security/staff dashboard: list active visitors
  if (["SUPER_ADMIN", "ADMIN", "STAFF"].includes(session.role)) {
    const visitors = await listActive(session.communityId);
    return NextResponse.json({ visitors });
  }

  // Resident: list own household visitors
  const { searchParams } = new URL(req.url);
  const householdId = searchParams.get("householdId");
  if (!householdId) return NextResponse.json({ error: "householdId diperlukan" }, { status: 400 });

  const visitors = await listByHousehold(session.communityId, householdId);
  return NextResponse.json({ visitors });
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromCookie();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (session.role !== "RESIDENT") {
    return NextResponse.json({ error: "Hanya warga yang dapat mendaftarkan pengunjung" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validasi gagal", details: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const visitor = await createVisitor(
      session.communityId,
      session.userId, // householdId = resident's userId per schema (householdId is userId for resident)
      {
        ...parsed.data,
        validFrom: new Date(parsed.data.validFrom),
        validUntil: new Date(parsed.data.validUntil),
      },
    );
    return NextResponse.json({ visitor }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}