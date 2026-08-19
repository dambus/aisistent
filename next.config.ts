import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['@react-pdf/renderer'],
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'aisistent.rs' }],
        destination: 'https://www.aisistent.rs/:path*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
