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
      // SEO: kanibalizacija fix, 19.08.2026 — spojeno u ugovor-o-delu-vs-ugovor-o-radu
      // (skoro duplikat sadrzaja, unikatni deo prenet pre gasenja). Vidi
      // docs/handover/2026-08-19-kanibalizacija-audit.md
      {
        source: '/blog/razlika-izmedju-ugovora-o-radu-i-ugovora-o-delu',
        destination: '/blog/ugovor-o-delu-vs-ugovor-o-radu',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
