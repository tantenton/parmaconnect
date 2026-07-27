import { describe, it, expect } from "vitest";
import { assertTransition } from "@/lib/packages/package-service";

describe("package-status transitions", () => {
  it("ARRIVED → NOTIFIED is allowed", () => {
    expect(() => assertTransition("ARRIVED", "NOTIFIED")).not.toThrow();
  });

  it("ARRIVED → RETURNED is allowed", () => {
    expect(() => assertTransition("ARRIVED", "RETURNED")).not.toThrow();
  });

  it("ARRIVED → EXPIRED is allowed", () => {
    expect(() => assertTransition("ARRIVED", "EXPIRED")).not.toThrow();
  });

  it("NOTIFIED → PICKED_UP is allowed", () => {
    expect(() => assertTransition("NOTIFIED", "PICKED_UP")).not.toThrow();
  });

  it("NOTIFIED → RETURNED is allowed", () => {
    expect(() => assertTransition("NOTIFIED", "RETURNED")).not.toThrow();
  });

  it("NOTIFIED → EXPIRED is allowed", () => {
    expect(() => assertTransition("NOTIFIED", "EXPIRED")).not.toThrow();
  });

  it("ARRIVED → PICKED_UP is NOT allowed (must notify first)", () => {
    expect(() => assertTransition("ARRIVED", "PICKED_UP")).toThrow(
      "Tidak dapat mengubah status dari ARRIVED ke PICKED_UP",
    );
  });

  it("PICKED_UP → anything is NOT allowed (terminal state)", () => {
    expect(() => assertTransition("PICKED_UP", "NOTIFIED")).toThrow();
    expect(() => assertTransition("PICKED_UP", "RETURNED")).toThrow();
    expect(() => assertTransition("PICKED_UP", "EXPIRED")).toThrow();
  });

  it("RETURNED → anything is NOT allowed (terminal state)", () => {
    expect(() => assertTransition("RETURNED", "ARRIVED")).toThrow();
    expect(() => assertTransition("RETURNED", "NOTIFIED")).toThrow();
  });

  it("EXPIRED → anything is NOT allowed (terminal state)", () => {
    expect(() => assertTransition("EXPIRED", "ARRIVED")).toThrow();
    expect(() => assertTransition("EXPIRED", "NOTIFIED")).toThrow();
  });

  it("rejects transition from unknown status", () => {
    expect(() => assertTransition("UNKNOWN", "ARRIVED")).toThrow();
  });
});