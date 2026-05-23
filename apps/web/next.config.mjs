/** @type {import('next').NextConfig} */
const apiBaseUrl = process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true
  },
  async rewrites() {
    return [
      {
        source: "/api/backend/:path*",
        destination: `${apiBaseUrl}/:path*`
      }
    ];
  },
  transpilePackages: ["@economysim/domain", "@economysim/ui"]
};

export default nextConfig;
