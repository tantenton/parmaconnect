import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [],
  },
  logging: {
    fetches: {
      fullUrl: false,
    },
  },
};

export default nextConfig;