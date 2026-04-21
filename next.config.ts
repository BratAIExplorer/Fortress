
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // In Next.js 16, turbopack settings have moved to the top level
  // @ts-ignore - NextConfig type might lag behind new Turbopack keys
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
