import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "@lancedb/lancedb",
    "better-sqlite3",
    "apache-arrow",
  ],
};

export default nextConfig;
