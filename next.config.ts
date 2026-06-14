import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  eslint: {
    // Only fail on errors, not warnings
    ignoreDuringBuilds: false,
  },
  typescript: {
    // Don't ignore TypeScript errors - fix them instead
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
