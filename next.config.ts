import type { NextConfig } from "next";

const cspHeader = `
  default-src 'self' blob: data: https:;
  script-src 'self' 'unsafe-eval' 'unsafe-inline' https:;
  style-src 'self' 'unsafe-inline' https:;
  img-src 'self' blob: data: https:;
  font-src 'self' data: https:;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors *;
  connect-src 'self' blob: data: https:;
`.replace(/\s{2,}/g, ' ').trim();

const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()',
  },
  {
    key: 'X-Permitted-Cross-Domain-Policies',
    value: 'none',
  },
  {
    key: 'Content-Security-Policy',
    value: cspHeader,
  },
];

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["@prisma/client", "better-sqlite3", "@prisma/adapter-better-sqlite3"],
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
