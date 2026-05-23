/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true
  },
  transpilePackages: ["@economysim/domain", "@economysim/ui"]
};

export default nextConfig;
