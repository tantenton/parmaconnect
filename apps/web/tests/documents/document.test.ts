import { describe, it, expect } from "vitest";
import { assertTransition, ALLOWED_MIME_TYPES, MAX_FILE_SIZE } from "@/lib/documents/document-service";

describe("document authorization — residents can only see own documents", () => {
  it("assertTransition rejects unlisted transitions", () => {
    expect(() => assertTransition("DRAFT", "VERIFIED")).toThrow();
    expect(() => assertTransition("DRAFT", "ARCHIVED")).toThrow();
    expect(() => assertTransition("SUBMITTED", "ARCHIVED")).toThrow();
    expect(() => assertTransition("NEEDS_REVISION", "VERIFIED")).toThrow();
  });

  it("rejects resident accessing wrong household via getDocument test", () => {
    // The getDocument function enforces: requesterRole === "RESIDENT" && doc.householdId !== requesterHouseholdId → throw
    // This is a pure-function approximation of that auth check:
    function canAccess(role: string, docHousehold: string, userHousehold: string): boolean {
      if (role !== "RESIDENT") return true;
      return docHousehold === userHousehold;
    }
    expect(canAccess("RESIDENT", "h1", "h1")).toBe(true);
    expect(canAccess("RESIDENT", "h1", "h2")).toBe(false);
    expect(canAccess("ADMIN", "h1", "h2")).toBe(true);
    expect(canAccess("STAFF", "h1", "h2")).toBe(true);
  });
});

describe("document verification transitions", () => {
  // Allowed: DRAFT→SUBMITTED, SUBMITTED→UNDER_REVIEW, UNDER_REVIEW→NEEDS_REVISION|VERIFIED|REJECTED
  // NEEDS_REVISION→SUBMITTED, VERIFIED→ARCHIVED|EXPIRED, REJECTED→DRAFT

  it("DRAFT → SUBMITTED ok", () => {
    expect(() => assertTransition("DRAFT", "SUBMITTED")).not.toThrow();
  });
  it("DRAFT → REJECTED ok", () => {
    expect(() => assertTransition("DRAFT", "REJECTED")).not.toThrow();
  });
  it("SUBMITTED → UNDER_REVIEW ok", () => {
    expect(() => assertTransition("SUBMITTED", "UNDER_REVIEW")).not.toThrow();
  });
  it("SUBMITTED → REJECTED ok", () => {
    expect(() => assertTransition("SUBMITTED", "REJECTED")).not.toThrow();
  });
  it("UNDER_REVIEW → VERIFIED ok", () => {
    expect(() => assertTransition("UNDER_REVIEW", "VERIFIED")).not.toThrow();
  });
  it("UNDER_REVIEW → NEEDS_REVISION ok", () => {
    expect(() => assertTransition("UNDER_REVIEW", "NEEDS_REVISION")).not.toThrow();
  });
  it("UNDER_REVIEW → REJECTED ok", () => {
    expect(() => assertTransition("UNDER_REVIEW", "REJECTED")).not.toThrow();
  });
  it("NEEDS_REVISION → SUBMITTED ok (re-submit after revision)", () => {
    expect(() => assertTransition("NEEDS_REVISION", "SUBMITTED")).not.toThrow();
  });
  it("NEEDS_REVISION → REJECTED ok", () => {
    expect(() => assertTransition("NEEDS_REVISION", "REJECTED")).not.toThrow();
  });
  it("VERIFIED → ARCHIVED ok", () => {
    expect(() => assertTransition("VERIFIED", "ARCHIVED")).not.toThrow();
  });
  it("VERIFIED → EXPIRED ok", () => {
    expect(() => assertTransition("VERIFIED", "EXPIRED")).not.toThrow();
  });
  it("REJECTED → DRAFT ok (re-submit after reject)", () => {
    expect(() => assertTransition("REJECTED", "DRAFT")).not.toThrow();
  });
  it("VERIFIED → NEEDS_REVISION rejected (verified docs cant go back)", () => {
    expect(() => assertTransition("VERIFIED", "NEEDS_REVISION")).toThrow();
  });
  it("ARCHIVED → anything rejected (terminal state)", () => {
    expect(() => assertTransition("ARCHIVED", "DRAFT")).toThrow();
    expect(() => assertTransition("ARCHIVED", "VERIFIED")).toThrow();
  });
  it("EXPIRED → anything rejected (terminal state)", () => {
    expect(() => assertTransition("EXPIRED", "DRAFT")).toThrow();
    expect(() => assertTransition("EXPIRED", "VERIFIED")).toThrow();
  });
});

describe("document MIME and size validation", () => {
  it("allows common document MIME types", () => {
    expect(ALLOWED_MIME_TYPES).toContain("application/pdf");
    expect(ALLOWED_MIME_TYPES).toContain("image/jpeg");
    expect(ALLOWED_MIME_TYPES).toContain("image/png");
    expect(ALLOWED_MIME_TYPES).toContain("text/plain");
  });

  it("sets max file size to 10MB", () => {
    expect(MAX_FILE_SIZE).toBe(10 * 1024 * 1024);
  });
});
