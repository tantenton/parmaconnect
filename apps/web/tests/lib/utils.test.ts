import { describe, it, expect } from "vitest";
import { formatCurrency, maskSensitive, normalizeLicensePlate, cn } from "@/lib/utils";

describe("formatCurrency", () => {
  it("formats IDR with no decimals", () => {
    expect(formatCurrency(150000)).toBe("Rp\u00A0150.000");
  });
});

describe("maskSensitive", () => {
  it("masks middle of long string", () => {
    const result = maskSensitive("1234567890123456");
    expect(result).toContain("••••");
    expect(result.startsWith("1234")).toBe(true);
    expect(result.endsWith("3456")).toBe(true);
  });

  it("masks fully for short string", () => {
    expect(maskSensitive("12345")).toBe("••••••••");
  });
});

describe("normalizeLicensePlate", () => {
  it("strips spaces and uppercases", () => {
    expect(normalizeLicensePlate("B 1234 ABC")).toBe("B1234ABC");
  });
});

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("px-4", "py-2")).toBe("px-4 py-2");
  });

  it("resolves conflicting tailwind classes", () => {
    const result = cn("px-4", "px-6");
    expect(result).not.toContain("px-4");
    expect(result).toContain("px-6");
  });
});
