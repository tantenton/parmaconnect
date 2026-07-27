import { describe, it, expect } from "vitest";
import { normalizePhone, getVisibleCategories } from "@/lib/contacts/contact-service";

describe("contact phone normalization", () => {
  it("normalizes 08xxx to 628xxx", () => {
    expect(normalizePhone("08123456789")).toBe("628123456789");
  });
  it("normalizes 8xxx to 628xxx", () => {
    expect(normalizePhone("8123456789")).toBe("628123456789");
  });
  it("keeps 62xxx as-is", () => {
    expect(normalizePhone("628123456789")).toBe("628123456789");
  });
  it("strips non-digits", () => {
    expect(normalizePhone("+62 812-345-678")).toBe("6281234567 8".replace(/\D/g, ""));
  });
});

describe("contact visibility enforcement", () => {
  it("admin sees all visibilities", () => {
    expect(getVisibleCategories("ADMIN_ONLY", "ADMIN")).toBe(true);
    expect(getVisibleCategories("STAFF_ONLY", "ADMIN")).toBe(true);
    expect(getVisibleCategories("RESIDENTS_ONLY", "ADMIN")).toBe(true);
    expect(getVisibleCategories("PUBLIC", "ADMIN")).toBe(true);
  });
  it("staff sees PUBLIC, RESIDENTS_ONLY, STAFF_ONLY but not ADMIN_ONLY", () => {
    expect(getVisibleCategories("PUBLIC", "STAFF")).toBe(true);
    expect(getVisibleCategories("RESIDENTS_ONLY", "STAFF")).toBe(true);
    expect(getVisibleCategories("STAFF_ONLY", "STAFF")).toBe(true);
    expect(getVisibleCategories("ADMIN_ONLY", "STAFF")).toBe(false);
  });
  it("resident sees only PUBLIC", () => {
    expect(getVisibleCategories("PUBLIC", "RESIDENT")).toBe(true);
    expect(getVisibleCategories("RESIDENTS_ONLY", "RESIDENT")).toBe(false);
    expect(getVisibleCategories("STAFF_ONLY", "RESIDENT")).toBe(false);
    expect(getVisibleCategories("ADMIN_ONLY", "RESIDENT")).toBe(false);
  });
});
