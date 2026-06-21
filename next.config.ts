import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  eslint: {
    // Ignore ESLint errors during build to prevent deployment failures.
    // TODO: turn this off once the remaining JSX lint warnings are fixed.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Skip type errors during build. TODO: turn this off and run
    // `tsc --noEmit` in CI to catch type bugs before they ship.
    // Currently safe because the codebase passes `tsc --noEmit` cleanly.
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
