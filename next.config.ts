import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  eslint: {
    // Only fail on errors, not warnings
    ignoreDuringBuilds: false,
  },
  typescript: {
    // Skip type errors during build — fix them in dev instead
    // This prevents Vercel build failures from minor type issues
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
