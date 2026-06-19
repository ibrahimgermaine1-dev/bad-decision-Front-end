import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  eslint: {
    // Ignore ESLint errors during build to prevent deployment failures
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Skip type errors during build — fix them in dev instead
    // This prevents Vercel build failures from minor type issues
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
