"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { CommunityConfig } from "@/config/community";

const ConfigContext = createContext<CommunityConfig | null>(null);

export function ConfigProvider({
  config,
  children,
}: {
  config: CommunityConfig;
  children: ReactNode;
}) {
  return (
    <ConfigContext.Provider value={config}>
      {children}
    </ConfigContext.Provider>
  );
}

/**
 * Hook to access community config in client components.
 * Must be used within a ConfigProvider.
 */
export function useCommunityConfig(): CommunityConfig {
  const config = useContext(ConfigContext);
  if (!config) {
    throw new Error(
      "useCommunityConfig must be used within a ConfigProvider",
    );
  }
  return config;
}