import type { NextConfig } from "next";
import path from "node:path";

const bigintBufferAlias = path.join(process.cwd(), "lib", "bigint-buffer.ts");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  turbopack: {
    resolveAlias: {
      "bigint-buffer": "./lib/bigint-buffer.ts",
    },
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "bigint-buffer": bigintBufferAlias,
    };

    return config;
  },
};

export default nextConfig;
