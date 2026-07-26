import { z } from "zod";

export const moduleFlagsSchema = z.object({
  residents: z.boolean().default(true),
  households: z.boolean().default(true),
  documentArchive: z.boolean().default(true),
  announcements: z.boolean().default(true),
  reports: z.boolean().default(true),
  events: z.boolean().default(true),
  contacts: z.boolean().default(true),
  vehicles: z.boolean().default(true),
  billing: z.boolean().default(true),
  payments: z.boolean().default(true),
  visitors: z.boolean().default(true),
  securityEvents: z.boolean().default(false),
  cctvIntegrations: z.boolean().default(false),
});

export type ModuleFlags = z.infer<typeof moduleFlagsSchema>;

export const REQUIRED_SECURITY_CONTROLS = [
  "authorization",
  "auditLogging",
  "privateDocumentStorage",
  "serverSideValidation",
  "secureSessionHandling",
] as const;

export type RequiredSecurityControl = typeof REQUIRED_SECURITY_CONTROLS[number];

export const communityConfigSchema = z.object({
  applicationName: z.string().min(1),
  communityName: z.string().min(1),
  communityShortName: z.string().min(1),
  parentArea: z.string().min(1),
  logo: z.string().optional(),
  favicon: z.string().optional(),
  primaryLocale: z.string().default("id-ID"),
  timeZone: z.string().default("Asia/Jakarta"),
  currency: z.string().default("IDR"),
  addressTerminology: z.string().default("Alamat"),
  blockTerminology: z.string().default("Blok"),
  unitTerminology: z.string().default("Unit Rumah"),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().optional(),
  modules: moduleFlagsSchema,
  documentRetentionDays: z.number().int().positive().default(2555),
  billing: z.object({
    monthlyFeeAmount: z.number().nonnegative().default(150000),
    generationDay: z.number().int().min(1).max(28).default(1),
    dueDay: z.number().int().min(1).max(28).default(10),
    carryForward: z.boolean().default(true),
    penaltyEnabled: z.boolean().default(false),
  }),
});

export type CommunityConfig = z.infer<typeof communityConfigSchema>;

export const defaultCommunityConfig: CommunityConfig = {
  applicationName: "ParmaConnect",
  communityName: "Cluster Parma",
  communityShortName: "Parma",
  parentArea: "Mutiara Columbus",
  primaryLocale: "id-ID",
  timeZone: "Asia/Jakarta",
  currency: "IDR",
  addressTerminology: "Alamat",
  blockTerminology: "Blok",
  unitTerminology: "Unit Rumah",
  contactEmail: "admin@clusterparma.local",
  contactPhone: "+62-000-0000-0000",
  modules: {
    residents: true,
    households: true,
    documentArchive: true,
    announcements: true,
    reports: true,
    events: true,
    contacts: true,
    vehicles: true,
    billing: true,
    payments: true,
    visitors: true,
    securityEvents: false,
    cctvIntegrations: false,
  },
  documentRetentionDays: 2555,
  billing: {
    monthlyFeeAmount: 150000,
    generationDay: 1,
    dueDay: 10,
    carryForward: true,
    penaltyEnabled: false,
  },
};

export function getCommunityConfig(overrides?: Partial<CommunityConfig>): CommunityConfig {
  const mergedModules = {
    ...defaultCommunityConfig.modules,
    ...overrides?.modules,
  };
  const mergedBilling = {
    ...defaultCommunityConfig.billing,
    ...overrides?.billing,
  };
  return communityConfigSchema.parse({
    ...defaultCommunityConfig,
    ...overrides,
    modules: mergedModules,
    billing: mergedBilling,
  });
}

export function isModuleEnabled(config: CommunityConfig, module: keyof ModuleFlags): boolean {
  return config.modules[module] === true;
}
