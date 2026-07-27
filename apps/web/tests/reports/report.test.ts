import { describe, it, expect } from "vitest";
import { assertTransition, filterTimelineForResident } from "@/lib/reports/report-service";

describe("report transitions", () => {
  it("NEW → VERIFIED ok", () => {
    expect(() => assertTransition("NEW", "VERIFIED")).not.toThrow();
  });
  it("NEW → ASSIGNED rejected (must verify first)", () => {
    expect(() => assertTransition("NEW", "ASSIGNED")).toThrow();
  });
  it("VERIFIED → ASSIGNED ok", () => {
    expect(() => assertTransition("VERIFIED", "ASSIGNED")).not.toThrow();
  });
  it("ASSIGNED → IN_PROGRESS ok", () => {
    expect(() => assertTransition("ASSIGNED", "IN_PROGRESS")).not.toThrow();
  });
  it("IN_PROGRESS → RESOLVED ok", () => {
    expect(() => assertTransition("IN_PROGRESS", "RESOLVED")).not.toThrow();
  });
  it("RESOLVED → CLOSED ok", () => {
    expect(() => assertTransition("RESOLVED", "CLOSED")).not.toThrow();
  });
  it("RESOLVED → IN_PROGRESS ok (reopen after resolve)", () => {
    expect(() => assertTransition("RESOLVED", "IN_PROGRESS")).not.toThrow();
  });
  it("CLOSED → IN_PROGRESS ok (reopen)", () => {
    expect(() => assertTransition("CLOSED", "IN_PROGRESS")).not.toThrow();
  });
  it("NEW → REJECTED ok", () => {
    expect(() => assertTransition("NEW", "REJECTED")).not.toThrow();
  });
  it("NEW → DUPLICATE ok", () => {
    expect(() => assertTransition("NEW", "DUPLICATE")).not.toThrow();
  });
  it("NEW → RESOLVED rejected (resident cannot resolve directly)", () => {
    expect(() => assertTransition("NEW", "RESOLVED")).toThrow();
  });
  it("CLOSED → NEW rejected", () => {
    expect(() => assertTransition("CLOSED", "NEW")).toThrow();
  });
  it("REJECTED → NEW ok", () => {
    expect(() => assertTransition("REJECTED", "NEW")).not.toThrow();
  });
  it("DUPLICATE → NEW ok", () => {
    expect(() => assertTransition("DUPLICATE", "NEW")).not.toThrow();
  });
  it("ASSIGNED → NEW ok (unassign)", () => {
    expect(() => assertTransition("ASSIGNED", "NEW")).not.toThrow();
  });
});

describe("report timeline filtering for residents", () => {
  const timeline = [
    { action: "REPORT_CREATED", notes: "Created", performedBy: { id: "u1", name: "Resident", role: "RESIDENT" } },
    { action: "VERIFIED", notes: "Verified", performedBy: { id: "u2", name: "Admin", role: "ADMIN" } },
    { action: "INTERNAL_NOTE", notes: "Sensitive internal note", performedBy: { id: "u3", name: "Staff", role: "STAFF" } },
    { action: "ASSIGNED", notes: "Assigned", performedBy: { id: "u2", name: "Admin", role: "ADMIN" } },
    { action: "PROGRESS_ADDED", notes: "Progress update", performedBy: { id: "u3", name: "Staff", role: "STAFF" } },
    { action: "RESOLVED", notes: "Resolved", performedBy: { id: "u3", name: "Staff", role: "STAFF" } },
  ];

  it("filters out INTERNAL_NOTE for residents", () => {
    const filtered = filterTimelineForResident(timeline as never);
    expect(filtered.length).toBe(5);
    expect(filtered.find((t) => t.action === "INTERNAL_NOTE")).toBeUndefined();
  });

  it("keeps all non-internal actions", () => {
    const filtered = filterTimelineForResident(timeline as never);
    expect(filtered.map((t) => t.action)).toEqual([
      "REPORT_CREATED", "VERIFIED", "ASSIGNED", "PROGRESS_ADDED", "RESOLVED",
    ]);
  });
});
