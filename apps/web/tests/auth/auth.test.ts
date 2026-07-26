import { describe, it, expect, afterAll } from "vitest";
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { hashPassword, verifyPassword, verifySessionToken } from "@/lib/auth/auth-service";
import { hasMinRank, hasPermission, canManageRole, requireRole } from "@/lib/auth/permissions";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = new PrismaClient({ adapter: new PrismaPg(pool) });

describe("Auth Service", () => {
  describe("Password hashing", () => {
    it("should hash and verify passwords correctly", async () => {
      const password = "TestPassword123!";
      const hash = await hashPassword(password);
      expect(hash).toBeTruthy();
      expect(hash).not.toBe(password);

      const valid = await verifyPassword(password, hash);
      expect(valid).toBe(true);

      const invalid = await verifyPassword("WrongPassword", hash);
      expect(invalid).toBe(false);
    });
  });

  describe("Session token", () => {
    it("should reject invalid tokens", async () => {
      const result = await verifySessionToken("invalid-token");
      expect(result).toBeNull();
    });

    it("should reject expired tokens", async () => {
      // Manually crafted expired token
      const result = await verifySessionToken("eyJhbGciOiJIUzI1NiJ9.eyJleHAiOjE1MDAwMDAwMDB9.abc");
      expect(result).toBeNull();
    });
  });

  describe("Database users", () => {
    it("should have seed admin user", async () => {
      const admin = await db.user.findFirst({
        where: { email: "admin@clusterparma.local" },
      });
      expect(admin).toBeTruthy();
      expect(admin?.role).toBe("ADMIN");
    });

    it("should have all role demo accounts", async () => {
      const roles = ["SUPER_ADMIN", "ADMIN", "DOCUMENT_ADMIN", "FINANCE_ADMIN", "SECURITY_OFFICER", "STAFF", "RESIDENT"] as const;
      for (const role of roles) {
        const user = await db.user.findFirst({
          where: { role: { equals: role } },
        });
        expect(user, `${role} user should exist`).toBeTruthy();
      }
    });

    it("should have password hashes on seed users", async () => {
      const users = await db.user.findMany({ take: 5 });
      for (const user of users) {
        expect(user.passwordHash).toBeTruthy();
        expect(user.passwordHash).toMatch(/^\$2[aby]\$\d{2}\$/);
      }
    });
  });
});

describe("Permissions System", () => {
  describe("Role hierarchy", () => {
    it("SUPER_ADMIN should have top rank", () => {
      expect(hasMinRank("SUPER_ADMIN", 100)).toBe(true);
      expect(hasMinRank("SUPER_ADMIN", 50)).toBe(true);
    });

    it("RESIDENT should have lowest rank", () => {
      expect(hasMinRank("RESIDENT", 10)).toBe(true);
      expect(hasMinRank("RESIDENT", 40)).toBe(false);
    });

    it("should identify admin roles", () => {
      expect(hasMinRank("ADMIN", 80)).toBe(true);
      expect(hasMinRank("STAFF", 40)).toBe(true);
    });
  });

  describe("Permission checks", () => {
    it("SUPER_ADMIN should have all permissions", () => {
      expect(hasPermission("SUPER_ADMIN", "USER_CREATE")).toBe(true);
      expect(hasPermission("SUPER_ADMIN", "AUDIT_READ")).toBe(true);
      expect(hasPermission("SUPER_ADMIN", "COMMUNITY_CONFIG")).toBe(true);
    });

    it("RESIDENT should have limited permissions", () => {
      expect(hasPermission("RESIDENT", "ADMIN_PANEL")).toBe(false);
      expect(hasPermission("RESIDENT", "USER_CREATE")).toBe(false);
      expect(hasPermission("RESIDENT", "AUDIT_READ")).toBe(false);
    });

    it("STAFF should have basic admin permissions", () => {
      expect(hasPermission("STAFF", "ADMIN_PANEL")).toBe(true);
      expect(hasPermission("STAFF", "RESIDENT_READ")).toBe(true);
      expect(hasPermission("STAFF", "USER_CREATE")).toBe(false);
    });
  });

  describe("Role management", () => {
    it("SUPER_ADMIN can manage all roles", () => {
      expect(canManageRole("SUPER_ADMIN", "RESIDENT")).toBe(true);
      expect(canManageRole("SUPER_ADMIN", "ADMIN")).toBe(true);
      expect(canManageRole("SUPER_ADMIN", "SUPER_ADMIN")).toBe(true);
    });

    it("ADMIN cannot manage SUPER_ADMIN", () => {
      expect(canManageRole("ADMIN", "SUPER_ADMIN")).toBe(false);
      expect(canManageRole("ADMIN", "RESIDENT")).toBe(true);
    });

    it("RESIDENT cannot manage any role", () => {
      expect(canManageRole("RESIDENT", "RESIDENT")).toBe(false);
      expect(canManageRole("RESIDENT", "ADMIN")).toBe(false);
    });
  });

  describe("Route protection", () => {
    it("should reject unauthenticated access", () => {
      expect(requireRole(undefined, 10)).toBe(false);
    });

    it("RESIDENT should not access admin routes", () => {
      expect(hasPermission("RESIDENT", "ADMIN_PANEL")).toBe(false);
    });
  });
});

afterAll(async () => {
  await db.$disconnect();
  await pool.end();
});