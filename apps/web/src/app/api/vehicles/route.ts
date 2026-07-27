import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookie } from "@/lib/auth/auth-service";
import { createVehicle, listVehicles } from "@/lib/vehicles/vehicle-service";
import { z } from "zod";

const createSchema = z.object({
  licensePlate: z.string().min(2).max(15),
  vehicleType: z.enum(["MOTORCYCLE", "CAR", "TRUCK", "OTHER"]),
  brand: z.string().max(50).optional(),
  model: z.string().max(50).optional(),
  color: z.string().max(30).optional(),
  stickerNumber: z.string().max(30).optional(),
  householdId: z.string().optional(),
});

function isAdminOrStaff(role: string): boolean {
  return ["SUPER_ADMIN", "ADMIN", "STAFF"].includes(role);
}

export async function GET(req: NextRequest) {
  const session = await getSessionFromCookie();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || undefined;
  const vehicleType = searchParams.get("vehicleType") || undefined;
  const householdId = searchParams.get("householdId") || undefined;
  const search = searchParams.get("search") || undefined;
  const plate = searchParams.get("plate") || undefined;
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");

  // Residents see only their own vehicles
  const residentId = session.role === "RESIDENT" ? session.userId : (searchParams.get("residentId") || undefined);

  // Security/staff can lookup by plate (audited)
  if (plate && isAdminOrStaff(session.role)) {
    const { searchByPlate } = await import("@/lib/vehicles/vehicle-service");
    const vehicles = await searchByPlate(session.communityId, plate, session.userId);
    return NextResponse.json({ vehicles, total: vehicles.length, page: 1, limit: vehicles.length });
  }

  const result = await listVehicles(session.communityId, { status, vehicleType, residentId, householdId, search, page, limit });
  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromCookie();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Validasi gagal", details: parsed.error.flatten() }, { status: 400 });

  try {
    const vehicle = await createVehicle(session.communityId, session.userId, parsed.data);
    return NextResponse.json({ vehicle }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
