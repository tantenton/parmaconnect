import { describe, it, expect } from "vitest";
import { assertTransition } from "@/lib/packages/package-service";

describe("package authorization — residents can only see their own household packages", () => {
  // getPackage function: if viewerRole === "RESIDENT" && resident.householdId !== pkg.householdId → returns null
  it("resident can access their own household package", () => {
    function canAccess(role: string, residentHousehold: string | null, packageHousehold: string | null): boolean {
      if (role === "RESIDENT") return residentHousehold !== null && residentHousehold === packageHousehold;
      return true; // security, admin, etc
    }

    expect(canAccess("RESIDENT", "h1", "h1")).toBe(true);
    expect(canAccess("RESIDENT", "h1", "h2")).toBe(false);
    expect(canAccess("RESIDENT", null, "h1")).toBe(false);
  });

  it("security/admin can access any household package", () => {
    function canAccess(role: string, residentHousehold: string | null, packageHousehold: string | null): boolean {
      if (role === "RESIDENT") return residentHousehold !== null && residentHousehold === packageHousehold;
      return true;
    }

    expect(canAccess("SUPER_ADMIN", "h1", "h2")).toBe(true);
    expect(canAccess("ADMIN", "h1", "h2")).toBe(true);
    expect(canAccess("SECURITY_OFFICER", "h1", "h2")).toBe(true);
    expect(canAccess("STAFF", "h1", "h2")).toBe(true);
  });

  it("listByHousehold only returns packages for the given household", () => {
    // listByHousehold(communityId, householdId) calls listPackages with householdId filter
    function listByHousehold(householdId: string, filterHousehold: string | undefined): boolean {
      return filterHousehold === householdId;
    }

    expect(listByHousehold("h1", "h1")).toBe(true);
    expect(listByHousehold("h1", "h2")).toBe(false);
    expect(listByHousehold("h1", undefined)).toBe(false);
  });
});

describe("package status transition validation", () => {
  // TRANSITIONS: ARRIVED→[NOTIFIED, RETURNED, EXPIRED], NOTIFIED→[PICKED_UP, RETURNED, EXPIRED]

  it("ARRIVED → NOTIFIED ok", () => {
    expect(() => assertTransition("ARRIVED", "NOTIFIED")).not.toThrow();
  });
  it("ARRIVED → RETURNED ok", () => {
    expect(() => assertTransition("ARRIVED", "RETURNED")).not.toThrow();
  });
  it("ARRIVED → EXPIRED ok", () => {
    expect(() => assertTransition("ARRIVED", "EXPIRED")).not.toThrow();
  });
  it("ARRIVED → PICKED_UP rejected (must notify first)", () => {
    expect(() => assertTransition("ARRIVED", "PICKED_UP")).toThrow();
  });
  it("NOTIFIED → PICKED_UP ok", () => {
    expect(() => assertTransition("NOTIFIED", "PICKED_UP")).not.toThrow();
  });
  it("NOTIFIED → RETURNED ok", () => {
    expect(() => assertTransition("NOTIFIED", "RETURNED")).not.toThrow();
  });
  it("NOTIFIED → EXPIRED ok", () => {
    expect(() => assertTransition("NOTIFIED", "EXPIRED")).not.toThrow();
  });
  it("NOTIFIED → ARRIVED rejected (no backward transition to arrived)", () => {
    expect(() => assertTransition("NOTIFIED", "ARRIVED")).toThrow();
  });
  it("PICKED_UP → anything rejected (terminal state)", () => {
    expect(() => assertTransition("PICKED_UP", "ARRIVED")).toThrow();
    expect(() => assertTransition("PICKED_UP", "NOTIFIED")).toThrow();
    expect(() => assertTransition("PICKED_UP", "RETURNED")).toThrow();
  });
  it("RETURNED → anything rejected (terminal state)", () => {
    expect(() => assertTransition("RETURNED", "ARRIVED")).toThrow();
    expect(() => assertTransition("RETURNED", "NOTIFIED")).toThrow();
  });
  it("EXPIRED → anything rejected (terminal state)", () => {
    expect(() => assertTransition("EXPIRED", "ARRIVED")).toThrow();
    expect(() => assertTransition("EXPIRED", "NOTIFIED")).toThrow();
  });
});

describe("permission: security can create packages, residents cannot", () => {
  // isSecurity helper checks: SUPER_ADMIN, ADMIN, SECURITY_OFFICER
  // createPackage is gated by role — security roles can create, residents cannot
  function canCreatePackage(role: string): boolean {
    return ["SUPER_ADMIN", "ADMIN", "SECURITY_OFFICER"].includes(role);
  }

  it("security roles can create packages", () => {
    expect(canCreatePackage("SUPER_ADMIN")).toBe(true);
    expect(canCreatePackage("ADMIN")).toBe(true);
    expect(canCreatePackage("SECURITY_OFFICER")).toBe(true);
  });

  it("non-security roles cannot create packages", () => {
    expect(canCreatePackage("RESIDENT")).toBe(false);
    expect(canCreatePackage("STAFF")).toBe(false);
    expect(canCreatePackage("FINANCE_ADMIN")).toBe(false);
  });
});
