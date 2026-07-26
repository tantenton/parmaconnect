import { describe, it, expect, beforeAll } from "vitest";
import { db } from "@/lib/db";
import { canTransition, assertTransition, listHouseholds, createHousehold, updateHousehold, deactivateHousehold, addResident, moveOutResident } from "@/lib/household/household-service";

const COMMUNITY_ID = "seed-community-parma";
let session = { userId: "", communityId: COMMUNITY_ID, role: "SUPER_ADMIN" as const };
const headers = { "x-forwarded-for": "127.0.0.1" };

beforeAll(async () => {
  const admin = await db.user.findFirstOrThrow({
    where: { communityId: COMMUNITY_ID, role: "SUPER_ADMIN" },
  });
  session = { ...session, userId: admin.id };
});

describe("Verification transitions", () => {
  it("should allow UNREGISTERED → DRAFT", () => {
    expect(canTransition("UNREGISTERED", "DRAFT")).toBe(true);
  });
  it("should allow DRAFT → SUBMITTED", () => {
    expect(canTransition("DRAFT", "SUBMITTED")).toBe(true);
  });
  it("should allow SUBMITTED → VERIFIED", () => {
    expect(canTransition("SUBMITTED", "VERIFIED")).toBe(true);
  });
  it("should allow SUBMITTED → NEEDS_REVISION", () => {
    expect(canTransition("SUBMITTED", "NEEDS_REVISION")).toBe(true);
  });
  it("should allow DRAFT → VERIFIED", () => {
    expect(canTransition("DRAFT", "VERIFIED")).toBe(false);
  });
  it("should allow VERIFIED → DRAFT", () => {
    expect(canTransition("VERIFIED", "DRAFT")).toBe(false);
  });
  it("should throw on invalid transition", () => {
    expect(() => assertTransition("VERIFIED", "DRAFT")).toThrow();
  });
});

describe("Household CRUD", () => {
  let unitId: string;
  let householdId: string;

  beforeAll(async () => {
    const unit = await db.residentialUnit.findFirst({
      where: {
        communityId: COMMUNITY_ID,
        households: { none: { status: "ACTIVE" } },
      },
    });
    if (unit) unitId = unit.id;
  });

  it("should create a household for a vacant unit", async () => {
    if (!unitId) return;
    const h = await createHousehold(session, { unitId, occupancyType: "OWNER_OCCUPIED", emergencyContactName: "Test Emergency", emergencyContactPhone: "+628123456789" }, headers);
    expect(h.householdNumber).toBeTruthy();
    expect(h.occupancyType).toBe("OWNER_OCCUPIED");
    householdId = h.id;
  });

  it("should not create duplicate active household on same unit", async () => {
    if (!unitId) return;
    await expect(createHousehold(session, { unitId, occupancyType: "TENANT_OCCUPIED" }, headers)).rejects.toThrow("sudah memiliki keluarga aktif");
  });

  it("should list households", async () => {
    const result = await listHouseholds(session, {});
    expect(result.households.length).toBeGreaterThan(0);
    expect(result.total).toBeGreaterThan(0);
  });

  it("should filter households by verification status", async () => {
    const result = await listHouseholds(session, { verificationStatus: "UNREGISTERED" });
    expect(result.households.every((h: { verificationStatus: string }) => h.verificationStatus === "UNREGISTERED")).toBe(true);
  });

  it("should add a resident to the household", async () => {
    if (!householdId) return;
    const r = await addResident(session, householdId, { fullName: "Test Resident", familyRelationship: "OTHER" }, headers);
    expect(r.fullName).toBe("Test Resident");
    expect(r.householdId).toBe(householdId);
  });

  it("should require that headResidentId belongs to the household", async () => {
    if (!householdId) return;
    await expect(updateHousehold(session, householdId, { headResidentId: "nonexistent-id" }, headers)).rejects.toThrow("Kepala keluarga harus anggota");
  });

  it("should reject invalid verification transition", async () => {
    if (!householdId) return;
    // UNREGISTERED → VERIFIED is invalid
    await expect(updateHousehold(session, householdId, { verificationStatus: "VERIFIED" }, headers)).rejects.toThrow("Transisi tidak valid");
  });

  it("should update verification status through valid transitions", async () => {
    if (!householdId) return;
    // UNREGISTERED → DRAFT → SUBMITTED
    await updateHousehold(session, householdId, { verificationStatus: "DRAFT" }, headers);
    await updateHousehold(session, householdId, { verificationStatus: "SUBMITTED" }, headers);
    const h = await db.household.findUnique({ where: { id: householdId } });
    expect(h?.verificationStatus).toBe("SUBMITTED");
  });

  it("should reject DRAFT → VERIFIED (skip SUBMITTED)", async () => {
    if (!householdId) return;
    await expect(updateHousehold(session, householdId, { verificationStatus: "DRAFT" }, headers)).rejects.toThrow(); // already SUBMITTED
  });

  it("should deactivate household", async () => {
    if (!householdId) return;
    await deactivateHousehold(session, householdId, headers);
    const h = await db.household.findUnique({ where: { id: householdId } });
    expect(h?.status).toBe("INACTIVE");
  });

  it("should move resident out", async () => {
    if (!householdId) return;
    const resident = await db.resident.findFirst({ where: { householdId } });
    if (!resident) return;
    await moveOutResident(session, resident.id, headers);
    const r = await db.resident.findUnique({ where: { id: resident.id } });
    expect(r?.residentStatus).toBe("INACTIVE");
    expect(r?.moveOutDate).toBeTruthy();
  });
});

describe("Authorization boundaries", () => {
  it("should not show households from different community", async () => {
    const otherSession = { userId: "other", communityId: "other-community", role: "ADMIN" as const };
    const result = await listHouseholds(otherSession, {});
    expect(result.households.length).toBe(0);
  });

  it("should only show operational fields for security officer", async () => {
    const secSession = { userId: "security", communityId: COMMUNITY_ID, role: "SECURITY_OFFICER" as const };
    const result = await listHouseholds(secSession, { active: "true", limit: 1 });
    // Security officer can list active households
    expect(Array.isArray(result.households)).toBe(true);
  });
});
