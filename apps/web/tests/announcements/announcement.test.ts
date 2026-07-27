import { describe, it, expect, beforeAll } from "vitest";
import {
  assertTransition,
  isCurrentlyVisible,
  canAudienceView,
  canViewTargetBlocks,
} from "@/lib/announcements/announcement-service";

describe("announcement transitions", () => {
  it("DRAFT → PUBLISHED ok", () => {
    expect(() => assertTransition("DRAFT", "PUBLISHED")).not.toThrow();
  });
  it("DRAFT → SCHEDULED ok", () => {
    expect(() => assertTransition("DRAFT", "SCHEDULED")).not.toThrow();
  });
  it("PUBLISHED → DRAFT ok (unpublish)", () => {
    expect(() => assertTransition("PUBLISHED", "DRAFT")).not.toThrow();
  });
  it("ARCHIVED → PUBLISHED rejected", () => {
    expect(() => assertTransition("ARCHIVED", "PUBLISHED")).toThrow();
  });
  it("DRAFT → EXPIRED rejected", () => {
    expect(() => assertTransition("DRAFT", "EXPIRED")).toThrow();
  });
  it("PUBLISHED → ARCHIVED ok", () => {
    expect(() => assertTransition("PUBLISHED", "ARCHIVED")).not.toThrow();
  });
  it("PUBLISHED → EXPIRED ok", () => {
    expect(() => assertTransition("PUBLISHED", "EXPIRED")).not.toThrow();
  });
});

describe("announcement visibility", () => {
  it("DRAFT hidden", () => {
    expect(isCurrentlyVisible({ status: "DRAFT", startsAt: null, expiresAt: null })).toBe(false);
  });
  it("ARCHIVED hidden", () => {
    expect(isCurrentlyVisible({ status: "ARCHIVED", startsAt: null, expiresAt: null })).toBe(false);
  });
  it("EXPIRED hidden", () => {
    expect(isCurrentlyVisible({ status: "EXPIRED", startsAt: null, expiresAt: null })).toBe(false);
  });
  it("PUBLISHED visible when no dates", () => {
    expect(isCurrentlyVisible({ status: "PUBLISHED", startsAt: null, expiresAt: null })).toBe(true);
  });
  it("PUBLISHED hidden when start in future", () => {
    const future = new Date(Date.now() + 86400000);
    expect(isCurrentlyVisible({ status: "PUBLISHED", startsAt: future, expiresAt: null })).toBe(false);
  });
  it("PUBLISHED hidden when expired", () => {
    const past = new Date(Date.now() - 86400000);
    expect(isCurrentlyVisible({ status: "PUBLISHED", startsAt: null, expiresAt: past })).toBe(false);
  });
  it("SCHEDULED hidden when start in future", () => {
    const future = new Date(Date.now() + 86400000);
    expect(isCurrentlyVisible({ status: "SCHEDULED", startsAt: future, expiresAt: null })).toBe(false);
  });
  it("SCHEDULED visible when start passed and not expired", () => {
    const past = new Date(Date.now() - 3600000);
    expect(isCurrentlyVisible({ status: "SCHEDULED", startsAt: past, expiresAt: null })).toBe(true);
  });
});

describe("announcement audience", () => {
  it("ALL visible to resident", () => {
    expect(canAudienceView("ALL", "RESIDENT")).toBe(true);
  });
  it("RESIDENTS visible to resident", () => {
    expect(canAudienceView("RESIDENTS", "RESIDENT")).toBe(true);
  });
  it("ADMINS hidden from resident", () => {
    expect(canAudienceView("ADMINS", "RESIDENT")).toBe(false);
  });
  it("ADMINS visible to SUPER_ADMIN", () => {
    expect(canAudienceView("ADMINS", "SUPER_ADMIN")).toBe(true);
  });
  it("SECURITY hidden from FINANCE_ADMIN", () => {
    expect(canAudienceView("SECURITY", "FINANCE_ADMIN")).toBe(false);
  });
  it("STAFF visible to ADMIN", () => {
    expect(canAudienceView("STAFF", "ADMIN")).toBe(true);
  });
});

describe("announcement block targeting", () => {
  it("no target = visible to all", () => {
    expect(canViewTargetBlocks(null, "block-1", "RESIDENT")).toBe(true);
  });
  it("empty array = visible to all", () => {
    expect(canViewTargetBlocks([], "block-1", "RESIDENT")).toBe(true);
  });
  it("resident in target block = visible", () => {
    expect(canViewTargetBlocks(["block-1", "block-2"], "block-1", "RESIDENT")).toBe(true);
  });
  it("resident outside target = hidden", () => {
    expect(canViewTargetBlocks(["block-1"], "block-2", "RESIDENT")).toBe(false);
  });
  it("resident with no block = hidden when targets exist", () => {
    expect(canViewTargetBlocks(["block-1"], null, "RESIDENT")).toBe(false);
  });
  it("admin bypasses block targeting", () => {
    expect(canViewTargetBlocks(["block-1"], null, "ADMIN")).toBe(true);
  });
  it("staff bypasses block targeting", () => {
    expect(canViewTargetBlocks(["block-1"], "block-9", "STAFF")).toBe(true);
  });
});
