import type { NextConfig } from "next";

const PROD_SITE = "https://metric.agency";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || PROD_SITE;

function siteOrigin(url: string): string {
  try {
    return new URL(url).origin;
  } catch {
    return PROD_SITE;
  }
}

function supabaseStorageHosts(): string[] {
  const hosts = new Set<string>();
  const raw =
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
  try {
    if (raw) hosts.add(new URL(raw).hostname);
  } catch {
    /* ignore */
  }
  return Array.from(hosts).filter(Boolean);
}

const securityHeaders = [
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
];

const nextConfig: NextConfig = {
  // Hostinger Node.js / VPS — SSR (`next build` + `next start`), not static export
  trailingSlash: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  reactStrictMode: true,
  experimental: {
    serverActions: {
      bodySizeLimit: "12mb",
      // Mitigate CSRF: only accept Server Actions from our origins
      allowedOrigins: [
        siteOrigin(siteUrl),
        siteOrigin(PROD_SITE),
        "metric.agency",
        "localhost:3000",
        "127.0.0.1:3000",
      ],
    },
  },
  images: {
    remotePatterns: supabaseStorageHosts().map((hostname) => ({
      protocol: "https" as const,
      hostname,
      pathname: "/storage/v1/object/public/**",
    })),
  },
  async redirects() {
    // Prefer apex host so www / non-www resolve to one canonical origin
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.metric.agency" }],
        destination: "https://metric.agency/:path*",
        permanent: true,
      },
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.metric.uz" }],
        destination: "https://metric.agency/:path*",
        permanent: true,
      },
      {
        source: "/:path*",
        has: [{ type: "host", value: "metric.uz" }],
        destination: "https://metric.agency/:path*",
        permanent: true,
      },
      // Legacy TIMSOL locale prefixes → EN (default, unprefixed)
      {
        source: "/en",
        destination: "/",
        permanent: true,
      },
      {
        source: "/en/:path*",
        destination: "/:path*",
        permanent: true,
      },
      {
        source: "/uz",
        destination: "/",
        permanent: true,
      },
      {
        source: "/uz/:path*",
        destination: "/:path*",
        permanent: true,
      },
      {
        source: "/ru",
        destination: "/",
        permanent: true,
      },
      {
        source: "/ru/:path*",
        destination: "/:path*",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        // Fingerprinted build assets — safe to cache forever.
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/images/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/admin/:path*",
        headers: [
          ...securityHeaders,
          {
            key: "Cache-Control",
            value: "private, no-store, max-age=0, must-revalidate",
          },
        ],
      },
      {
        source: "/api/:path*",
        headers: [
          ...securityHeaders,
          {
            key: "Cache-Control",
            value: "private, no-store, max-age=0, must-revalidate",
          },
        ],
      },
      {
        // HTML / RSC must NOT be CDN-cached for a year — after deploy the
        // document would keep old Turbopack chunk hashes → 404 text/plain CSS/JS
        // and "Refused to apply style ... MIME type ('text/plain')" in Chrome.
        source: "/:path*",
        headers: [
          ...securityHeaders,
          {
            key: "Cache-Control",
            value: "public, max-age=0, s-maxage=0, must-revalidate",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
