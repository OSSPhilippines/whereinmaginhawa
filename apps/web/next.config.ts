import type { NextConfig } from "next";
import path from "path";

const isDev = process.env.NODE_ENV === 'development';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseConnectSrc = isDev
  ? `${supabaseUrl} http://127.0.0.1:54321`
  : 'https://*.supabase.co';

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname, "../../"),
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              `script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live https://va.vercel-scripts.com https://vitals.vercel-insights.com https://www.googletagmanager.com https://pagead2.googlesyndication.com https://*.adtrafficquality.google https://www.google.com`,
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com data:",
              `img-src 'self' data: https: blob: ${isDev ? 'http://127.0.0.1:54321' : ''}`,
              `connect-src 'self' ${supabaseConnectSrc} https://vercel.live https://vitals.vercel-insights.com https://www.google-analytics.com https://pagead2.googlesyndication.com https://*.google.com https://*.adtrafficquality.google https://*.googlesyndication.com https://*.googleadservices.com`,
              "frame-src 'self' https://googleads.g.doubleclick.net https://www.google.com https://tpc.googlesyndication.com https://*.googlesyndication.com https://ep1.adtrafficquality.google https://ep2.adtrafficquality.google",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              ...(isDev ? [] : ["upgrade-insecure-requests"]),
            ].join('; '),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
