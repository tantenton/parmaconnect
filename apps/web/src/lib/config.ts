/**
 * DB-backed community configuration service.
 * Reads community settings from the database, falls back to defaults.
 */
import "server-only";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import {
  defaultCommunityConfig,
  communityConfigSchema,
  type CommunityConfig,
  type ModuleFlags,
} from "@/config/community";

const DEFAULT_COMMUNITY_SLUG = "cluster-parma";

/**
 * Load community config from DB, merging DB branding/moduleConfig with defaults.
 * In development/test, falls back to defaults if no community record exists.
 */
export async function loadCommunityConfig(
  slug?: string,
): Promise<CommunityConfig> {
  const communitySlug = slug ?? DEFAULT_COMMUNITY_SLUG;

  try {
    const community = await db.community.findUnique({
      where: { slug: communitySlug },
    });

    if (!community) {
      if (env.NODE_ENV === "production") {
        throw new Error(
          `Community with slug "${communitySlug}" not found in production`,
        );
      }
      return defaultCommunityConfig;
    }

    // Merge DB data with defaults
    const branding =
      typeof community.branding === "object" && community.branding
        ? (community.branding as Record<string, unknown>)
        : {};

    const moduleConfig =
      typeof community.moduleConfig === "object" && community.moduleConfig
        ? (community.moduleConfig as Record<string, unknown>)
        : {};

    return communityConfigSchema.parse({
      applicationName: env.NODE_ENV === "production" ? "ParmaConnect" : "ParmaConnect",
      communityName: community.name,
      communityShortName: community.shortName ?? defaultCommunityConfig.communityShortName,
      parentArea: community.parentArea ?? defaultCommunityConfig.parentArea,
      primaryLocale: community.locale,
      timeZone: community.timezone,
      currency: community.currency,
      logo: typeof branding.logo === "string" ? branding.logo : undefined,
      favicon: typeof branding.favicon === "string" ? branding.favicon : undefined,
      modules: {
        ...defaultCommunityConfig.modules,
        ...(moduleConfig as Partial<ModuleFlags>),
      },
      documentRetentionDays: 2555,
      billing: {
        ...defaultCommunityConfig.billing,
      },
    });
  } catch (error) {
    if (env.NODE_ENV === "production") {
      throw error;
    }
    // In dev/test, fall back to defaults on DB failure
    return defaultCommunityConfig;
  }
}

/**
 * Config cache for server components — reuse within the same request lifecycle.
 */
let cachedConfig: CommunityConfig | null = null;

export async function getCommunityConfigCached(
  slug?: string,
): Promise<CommunityConfig> {
  if (!cachedConfig) {
    cachedConfig = await loadCommunityConfig(slug);
  }
  return cachedConfig;
}

export function clearConfigCache(): void {
  cachedConfig = null;
}

export type { CommunityConfig, ModuleFlags };
