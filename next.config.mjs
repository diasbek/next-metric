// @ts-check
// Plain JS so Hostinger (glibc < 2.29) can load config without native SWC.
// `next.config.ts` is compiled synchronously via next-swc and fails there.

const PROD_SITE = "https://metric.graphics";
const PRODUCTION_HOSTS = new Set(["metric.graphics", "www.metric.graphics"]);
const NON_INDEXABLE_HOSTS = new Set([
  "metric.nocode.uz",
  "www.metric.nocode.uz",
  "localhost",
  "127.0.0.1",
]);

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || PROD_SITE;

/**
 * @param {string} url
 */
function siteOrigin(url) {
  try {
    return new URL(url).origin;
  } catch {
    return PROD_SITE;
  }
}

/** Mirror of `isIndexableDeployment` — keep inline; next.config cannot use `@/` imports. */
function isIndexableDeployment() {
  const allowFlag = process.env.NEXT_PUBLIC_ALLOW_INDEXING?.trim();
  if (allowFlag === "true") return true;
  if (allowFlag === "false") return false;

  if (process.env.VERCEL) {
    if (process.env.VERCEL_ENV !== "production") return false;
  } else if (process.env.NODE_ENV !== "production") {
    return false;
  }

  try {
    let host = new URL(siteUrl).hostname.toLowerCase();
    if (host.startsWith("www.")) host = host.slice(4);
    if (NON_INDEXABLE_HOSTS.has(host) || host.endsWith(".vercel.app")) {
      return false;
    }
    return PRODUCTION_HOSTS.has(host) || PRODUCTION_HOSTS.has(`www.${host}`);
  } catch {
    return false;
  }
}

function supabaseStorageHosts() {
  const hosts = new Set();
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

const noindexRobotsHeader = {
  key: "X-Robots-Tag",
  value: "noindex, nofollow, noarchive",
};

const indexable = isIndexableDeployment();

/** @type {import('next').NextConfig} */
const nextConfig = {
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
        "metric.graphics",
        "www.metric.graphics",
        "metric.agency",
        "localhost:3000",
        "127.0.0.1:3000",
      ],
    },
  },
  images: {
    // AVIF first (smaller at the same visual quality), WebP fallback.
    formats: ["image/avif", "image/webp"],
    // Next 16 only allows qualities listed here. 75 = default; 85 for
    // product / case photos that sit large on screen.
    qualities: [75, 85],
    // 320 matches category-card CSS width; 640 covers 2x.
    imageSizes: [32, 48, 64, 96, 128, 256, 320, 384, 640],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 2560, 3840],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    remotePatterns: supabaseStorageHosts().map((hostname) => ({
      protocol: "https",
      hostname,
      pathname: "/storage/v1/object/public/**",
    })),
  },
  async redirects() {
    // Prefer apex host so www / non-www resolve to one canonical origin
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.metric.graphics" }],
        destination: "https://metric.graphics/:path*",
        permanent: true,
      },
      {
        source: "/:path*",
        has: [{ type: "host", value: "metric.agency" }],
        destination: "https://metric.graphics/:path*",
        permanent: true,
      },
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.metric.agency" }],
        destination: "https://metric.graphics/:path*",
        permanent: true,
      },
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.metric.uz" }],
        destination: "https://metric.graphics/:path*",
        permanent: true,
      },
      {
        source: "/:path*",
        has: [{ type: "host", value: "metric.uz" }],
        destination: "https://metric.graphics/:path*",
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
          {
            key: "X-Robots-Tag",
            value: "noindex, nofollow",
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
          ...(indexable ? [] : [noindexRobotsHeader]),
        ],
      },
    ];
  },
};

export default nextConfig;
