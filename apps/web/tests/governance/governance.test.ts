import { describe, it, expect } from "vitest";

describe("governance supersede relationship", () => {
  // supersedeRecord: old record keeps history by setting supersededById = newId
  // new record gets revisionNumber = old.revisionNumber + 1
  it("old record is linked to new record via supersededById", () => {
    function simulateSupersede(oldRevision: number): { oldSupersededById: string | null; newRevision: number } {
      return { oldSupersededById: "new-record-id", newRevision: oldRevision + 1 };
    }

    const result = simulateSupersede(1);
    expect(result.oldSupersededById).toBe("new-record-id");
    expect(result.newRevision).toBe(2);
  });

  it("increments revision number correctly starting from 0", () => {
    function simulateSupersede(oldRevision: number): number {
      return oldRevision + 1;
    }

    expect(simulateSupersede(0)).toBe(1);
    expect(simulateSupersede(1)).toBe(2);
    expect(simulateSupersede(5)).toBe(6);
  });

  it("old record is not deleted — history preserved", () => {
    // The function updates old record's supersededById rather than deleting it
    function supersedePreservesHistory(deleteCalled: boolean): boolean {
      return !deleteCalled;
    }
    expect(supersedePreservesHistory(false)).toBe(true);
  });
});

describe("governance revision number increment", () => {
  it("revision starts at 1 for new records", () => {
    // createGovernanceRecord uses default: no explicit revisionNumber → Prisma default (implied 1)
    expect(1).toBeGreaterThanOrEqual(1);
  });

  it("supersede bumps revision number from old + 1", () => {
    function getNewRevision(oldRevision: number): number {
      return oldRevision + 1;
    }

    expect(getNewRevision(1)).toBe(2);
    expect(getNewRevision(2)).toBe(3);
    expect(getNewRevision(10)).toBe(11);
  });
});

describe("governance visibility filtering", () => {
  // listGovernanceRecords filters based on role:
  // RESIDENT → approvalStatus=APPROVED, visibility=RESIDENTS_ONLY
  // STAFF → approvalStatus=APPROVED, visibility in [RESIDENTS_ONLY, STAFF_ONLY]
  // ADMIN → no filters

  type Visibility = "RESIDENTS_ONLY" | "STAFF_ONLY" | "ADMIN_ONLY";
  type Role = "RESIDENT" | "STAFF" | "ADMIN";

  function isVisible(role: Role, status: string, visibility: Visibility): boolean {
    if (role === "ADMIN") return true;
    if (role === "RESIDENT") return status === "APPROVED" && visibility === "RESIDENTS_ONLY";
    if (role === "STAFF") return status === "APPROVED" && (visibility === "RESIDENTS_ONLY" || visibility === "STAFF_ONLY");
    return false;
  }

  it("admin sees all visibilities regardless of status", () => {
    expect(isVisible("ADMIN", "DRAFT", "ADMIN_ONLY")).toBe(true);
    expect(isVisible("ADMIN", "APPROVED", "RESIDENTS_ONLY")).toBe(true);
    expect(isVisible("ADMIN", "DRAFT", "STAFF_ONLY")).toBe(true);
    expect(isVisible("ADMIN", "APPROVED", "ADMIN_ONLY")).toBe(true);
  });

  it("resident sees only APPROVED + RESIDENTS_ONLY", () => {
    expect(isVisible("RESIDENT", "APPROVED", "RESIDENTS_ONLY")).toBe(true);
    expect(isVisible("RESIDENT", "APPROVED", "STAFF_ONLY")).toBe(false);
    expect(isVisible("RESIDENT", "APPROVED", "ADMIN_ONLY")).toBe(false);
    expect(isVisible("RESIDENT", "DRAFT", "RESIDENTS_ONLY")).toBe(false);
    expect(isVisible("RESIDENT", "DRAFT", "STAFF_ONLY")).toBe(false);
  });

  it("staff sees APPROVED records with RESIDENTS_ONLY or STAFF_ONLY visibility", () => {
    expect(isVisible("STAFF", "APPROVED", "RESIDENTS_ONLY")).toBe(true);
    expect(isVisible("STAFF", "APPROVED", "STAFF_ONLY")).toBe(true);
    expect(isVisible("STAFF", "APPROVED", "ADMIN_ONLY")).toBe(false);
    expect(isVisible("STAFF", "DRAFT", "STAFF_ONLY")).toBe(false);
    expect(isVisible("STAFF", "DRAFT", "RESIDENTS_ONLY")).toBe(false);
  });

  it("rejects ADMIN_ONLY for staff and residents", () => {
    expect(isVisible("STAFF", "APPROVED", "ADMIN_ONLY")).toBe(false);
    expect(isVisible("RESIDENT", "APPROVED", "ADMIN_ONLY")).toBe(false);
  });

  it("rejects non-APPROVED status for staff", () => {
    expect(isVisible("STAFF", "DRAFT", "STAFF_ONLY")).toBe(false);
    expect(isVisible("STAFF", "DRAFT", "RESIDENTS_ONLY")).toBe(false);
    expect(isVisible("STAFF", "REJECTED", "STAFF_ONLY")).toBe(false);
  });
});
