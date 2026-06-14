import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // SECURITY: Build errors and lint errors must not be silently ignored in production.
  // Previously had ignoreBuildErrors: true and ignoreDuringBuilds: true which masked
  // real issues. If build fails, fix the actual TypeScript/ESLint errors instead.
  reactStrictMode: false,
};

export default nextConfig;
