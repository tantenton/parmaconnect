import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookie } from "@/lib/auth/auth-service";
import {
  getVehicle, approveVehicle, suspendVehicle,
} from "@/lib/vehicles/vehicle-service";
import { z } from "zod";

function isAdmin(role: string): boolean {
  return ["SUPER_ADMIN", "ADMIN"].includes(role);
}

const actionSchema = z.object({
  action: z.enum(["approve", "suspend"]),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSessionFromCookie();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const vehicle = await getVehicle(session.communityId, id);
  if (!vehicle) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Resident: only own vehicles
  if (session.role === "RESIDENT" && vehicle.residentId !== session.userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({ vehicle });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSessionFromCookie();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isAdmin(session.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = actionSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Validasi gagal", details: parsed.error.flatten() }, { status: 400 });

  const { action } = parsed.data;

  try {
    switch (action) {
      case "approve":
        return NextResponse.json({ vehicle: await approveVehicle(session.communityId, id, session.userId) });
      case "suspend":
        return NextResponse.json({ vehicle: await suspendVehicle(session.communityId, id, session.userId) });
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
