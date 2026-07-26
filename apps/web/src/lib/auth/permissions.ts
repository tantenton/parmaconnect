/**
 * Role hierarchy and permission system.
 * Higher rank = more authority.
 */
export const ROLE_HIERARCHY: Record<string, number> = {
  SUPER_ADMIN: 100,
  ADMIN: 80,
  DOCUMENT_ADMIN: 60,
  FINANCE_ADMIN: 60,
  SECURITY_OFFICER: 50,
  STAFF: 40,
  RESIDENT: 10,
};

export type Role = keyof typeof ROLE_HIERARCHY;

export const ALL_ROLES = Object.keys(ROLE_HIERARCHY) as Role[];

export const ADMIN_ROLES: Role[] = [
  "SUPER_ADMIN",
  "ADMIN",
  "DOCUMENT_ADMIN",
  "FINANCE_ADMIN",
  "SECURITY_OFFICER",
  "STAFF",
];

export const PRIVILEGED_ROLES: Role[] = ["SUPER_ADMIN", "ADMIN"];

export const MANAGEABLE_ROLES: Record<Role, Role[]> = {
  SUPER_ADMIN: ALL_ROLES,
  ADMIN: ["DOCUMENT_ADMIN", "FINANCE_ADMIN", "SECURITY_OFFICER", "STAFF", "RESIDENT"],
  DOCUMENT_ADMIN: ["RESIDENT"],
  FINANCE_ADMIN: ["RESIDENT"],
  SECURITY_OFFICER: ["RESIDENT"],
  STAFF: ["RESIDENT"],
  RESIDENT: [],
};

/**
 * Check if a role has sufficient rank.
 */
export function hasMinRank(role: string, minRank: number): boolean {
  return (ROLE_HIERARCHY[role] ?? 0) >= minRank;
}

/**
 * Check if a role is an admin/staff role.
 */
export function isAdminRole(role: string): boolean {
  return ADMIN_ROLES.includes(role as Role);
}

/**
 * Check if a user can manage a target role.
 */
export function canManageRole(actorRole: string, targetRole: string): boolean {
  const manageable = MANAGEABLE_ROLES[actorRole as Role] ?? [];
  return manageable.includes(targetRole as Role);
}

/**
 * Check if an actor can perform an action on an entity owned by another user.
 */
export function canAccessResource(
  actorRole: string,
  actorUserId: string,
  resourceOwnerId: string | null,
): boolean {
  // Super admin can access anything
  if (actorRole === "SUPER_ADMIN") return true;
  // User can access their own resources
  if (resourceOwnerId && actorUserId === resourceOwnerId) return true;
  // Admin roles can access resident resources
  if (isAdminRole(actorRole)) return true;
  // Residents can only access their own
  return false;
}

/**
 * Permission definitions for granular access control.
 */
export const PERMISSIONS = {
  // User management
  USER_CREATE: { minRank: 80, label: "Membuat pengguna" },
  USER_READ: { minRank: 40, label: "Melihat pengguna" },
  USER_UPDATE: { minRank: 80, label: "Mengubah pengguna" },
  USER_DELETE: { minRank: 100, label: "Menghapus pengguna" },
  USER_CHANGE_ROLE: { minRank: 80, label: "Mengubah peran pengguna" },
  USER_DISABLE: { minRank: 80, label: "Menonaktifkan akun" },
  USER_ENABLE: { minRank: 80, label: "Mengaktifkan akun" },

  // Resident management
  RESIDENT_READ: { minRank: 40, label: "Melihat data warga" },
  RESIDENT_CREATE: { minRank: 50, label: "Mendaftarkan warga" },
  RESIDENT_UPDATE: { minRank: 50, label: "Mengubah data warga" },
  RESIDENT_VERIFY: { minRank: 60, label: "Memverifikasi warga" },
  RESIDENT_DELETE: { minRank: 80, label: "Menghapus data warga" },

  // Document management
  DOCUMENT_READ: { minRank: 40, label: "Melihat dokumen" },
  DOCUMENT_VERIFY: { minRank: 60, label: "Memverifikasi dokumen" },
  DOCUMENT_REJECT: { minRank: 60, label: "Menolak dokumen" },

  // Billing
  BILLING_READ: { minRank: 40, label: "Melihat tagihan" },
  BILLING_MANAGE: { minRank: 60, label: "Mengelola tagihan" },
  BILLING_REFUND: { minRank: 80, label: "Melakukan refund" },

  // Security
  SECURITY_READ: { minRank: 50, label: "Melihat data keamanan" },
  SECURITY_MANAGE: { minRank: 60, label: "Mengelola keamanan" },

  // Audit
  AUDIT_READ: { minRank: 80, label: "Melihat log audit" },

  // Admin
  ADMIN_PANEL: { minRank: 40, label: "Mengakses panel admin" },
  COMMUNITY_CONFIG: { minRank: 80, label: "Mengubah konfigurasi komunitas" },
} as const;

export type Permission = keyof typeof PERMISSIONS;

export function hasPermission(role: string, permission: Permission): boolean {
  const def = PERMISSIONS[permission];
  if (!def) return false;
  return hasMinRank(role, def.minRank);
}

export function requireRole(
  role: string | undefined,
  minRank: number,
): boolean {
  if (!role) return false;
  return hasMinRank(role, minRank);
}