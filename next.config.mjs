/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
  env: {
    ADK_BRIDGE_URL: process.env.ADK_BRIDGE_URL || "http://localhost:8000",
  },
};

export default nextConfig;
