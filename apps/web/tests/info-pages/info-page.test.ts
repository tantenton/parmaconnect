import { describe, it, expect } from "vitest";
import { slugify, sanitizeContent } from "@/lib/info-pages/info-page-service";

describe("info page slug generation", () => {
  it("generates slug from title", () => {
    expect(slugify("Aturan Parkir")).toBe("aturan-parkir");
  });
  it("handles special characters", () => {
    expect(slugify("Sampah & Kebersihan!")).toBe("sampah-kebersihan");
  });
  it("handles multiple spaces", () => {
    expect(slugify("  Multiple   Spaces  ")).toBe("multiple-spaces");
  });
});

describe("info page content sanitization", () => {
  it("removes script tags", () => {
    const dirty = '<p>hello</p><script>alert("xss")</script>';
    expect(sanitizeContent(dirty)).toBe("<p>hello</p>");
  });
  it("removes iframe tags", () => {
    const dirty = '<p>content</p><iframe src="evil.com"></iframe>';
    expect(sanitizeContent(dirty)).toBe("<p>content</p>");
  });
  it("preserves safe HTML", () => {
    const safe = "<p>Safe <strong>content</strong></p>";
    expect(sanitizeContent(safe)).toBe(safe);
  });
});
