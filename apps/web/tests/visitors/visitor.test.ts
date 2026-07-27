import { describe, it, expect } from "vitest";
import { generateVisitCode, isExpired } from "@/lib/visitors/visitor-service";

describe("generateVisitCode", () => {
  it("returns 8-character uppercase alphanumeric string", () => {
    const code = generateVisitCode();
    expect(code).toMatch(/^[A-Z0-9]{8}$/);
  });

  it("generates unique codes", () => {
    const codes = new Set<string>();
    for (let i = 0; i < 100; i++) {
      codes.add(generateVisitCode());
    }
    expect(codes.size).toBe(100);
  });
});

describe("isExpired", () => {
  it("returns true for past date", () => {
    expect(isExpired(new Date("2020-01-01"))).toBe(true);
  });

  it("returns false for future date", () => {
    const future = new Date();
    future.setFullYear(future.getFullYear() + 1);
    expect(isExpired(future)).toBe(false);
  });
});