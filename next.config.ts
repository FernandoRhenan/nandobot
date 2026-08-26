import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",
  serverExternalPackages: ["node-pg-migrate", "baileys"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "http2.mlstatic.com",
        search: "",
      },
      {
        protocol: "https",
        hostname: "m.media-amazon.com",
        search: "",
      },
    ],
  },
};

export default nextConfig;
