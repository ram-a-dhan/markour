import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["dev.markour.space"],
  experimental: {
    optimizePackageImports: [
      "@mantine/core",
      "@mantine/hooks",
    ],
  },
};

export default nextConfig;
