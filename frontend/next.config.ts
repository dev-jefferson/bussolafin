import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // "standalone" is only for the self-hosted Docker build (see frontend/Dockerfile).
  // Vercel's builder handles output itself and is known to misroute when this is set,
  // so skip it there — Vercel always sets the VERCEL env var during builds.
  output: process.env.VERCEL ? undefined : "standalone",
};

export default nextConfig;
