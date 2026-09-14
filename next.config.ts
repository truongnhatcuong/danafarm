import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    qualities: [75, 85, 90, 92, 95, 100],
    deviceSizes: [390, 640, 768, 1024, 1280, 1440, 1920],
    imageSizes: [64, 96, 120, 160, 240, 320, 410],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "theme.hstatic.net",
      },
      {
        protocol: "http",
        hostname: "theme.hstatic.net",
      },
      {
        protocol: "https",
        hostname: "utfs.io",
      },
      {
        protocol: "https",
        hostname: "cdn.hstatic.net",
      },
      {
        protocol: "http",
        hostname: "cdn.hstatic.net",
      },
      {
        protocol: "https",
        hostname: "file.hstatic.net",
      },
      {
        protocol: "http",
        hostname: "file.hstatic.net",
      },
      {
        protocol: "https",
        hostname: "product.hstatic.net",
      },
      {
        protocol: "http",
        hostname: "product.hstatic.net",
      },
      {
        protocol: "https",
        hostname: "bizweb.dktcdn.net",
      },
    ],
  },
};

export default nextConfig;
