import type { NextConfig } from "next";
import { CATEGORY_REDIRECTS } from "./src/lib/taxonomy";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.ikonicworld.com",
      },
      {
        protocol: "https",
        hostname: "ikonicworld.com",
      },
      {
        protocol: "https",
        hostname: "cdn.shopify.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      }
    ],
  },
  // Legacy category slugs 301 to their canonical pillar instead of serving duplicate pages.
  async redirects() {
    return CATEGORY_REDIRECTS;
  },
};

export default nextConfig;
