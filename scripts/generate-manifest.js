#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { getConfig } = require("./read-config");

function generateManifestContent(site) {
  return JSON.stringify(
    {
      id: "/",
      name: site.title,
      short_name: site.name,
      description: site.description,
      start_url: "/",
      scope: "/",
      display: "standalone",
      display_override: ["standalone", "browser"],
      orientation: "any",
      background_color: "#000000",
      theme_color: site.themeColor || "#2600ff",
      lang: site.defaultLocale || "ru",
      dir: "ltr",
      categories: ["business", "design"],
      icons: [
        {
          src: "/icons/icon-16.png",
          sizes: "16x16",
          type: "image/png",
          purpose: "any",
        },
        {
          src: "/icons/icon-32.png",
          sizes: "32x32",
          type: "image/png",
          purpose: "any",
        },
        {
          src: "/icons/icon-48.png",
          sizes: "48x48",
          type: "image/png",
          purpose: "any",
        },
        {
          src: "/icons/icon-192.png",
          sizes: "192x192",
          type: "image/png",
          purpose: "any",
        },
        {
          src: "/icons/icon-512.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "any",
        },
        {
          src: "/icons/icon-maskable-512.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "maskable",
        },
        {
          src: "/favicon.ico",
          sizes: "16x16 32x32 48x48",
          type: "image/x-icon",
        },
      ],
    },
    null,
    2,
  );
}

function generateManifest() {
  const { SITE_CONFIG } = getConfig();
  const manifestContent = generateManifestContent(SITE_CONFIG);
  const staticDir = path.join(process.cwd(), SITE_CONFIG.build.staticFilesDir);

  if (!fs.existsSync(staticDir)) {
    fs.mkdirSync(staticDir, { recursive: true });
  }

  const manifestPath = path.join(staticDir, "manifest.json");
  fs.writeFileSync(manifestPath, manifestContent);
  console.log(`Generated ${manifestPath}`);
}

if (require.main === module) {
  generateManifest();
}

module.exports = { generateManifest };
