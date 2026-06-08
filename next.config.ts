import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.clerk.com',
      },
    ],
  },
  // Skip static optimization for pages that use Clerk hooks
  // This prevents "Missing publishableKey" errors during build
  // On Vercel, env vars are available, so Clerk works at runtime
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
};

export default nextConfig;
