import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "*.trycloudflare.com",
    "127.0.0.1",
    "yourtruths.net",
    "www.yourtruths.net",
  ],
  turbopack: {
    root: __dirname,
  },
  experimental: {
    proxyClientMaxBodySize: "80mb",
    serverActions: {
      bodySizeLimit: "80mb",
    },
  },
};

export default nextConfig;
