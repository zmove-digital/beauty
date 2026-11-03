import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    // Local artwork only. Add remote Shopify/CDN hosts here when swapping assets.
    remotePatterns: [],
    formats: ["image/avif", "image/webp"],
  },
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
