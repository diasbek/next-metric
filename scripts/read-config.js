#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

function extractStringValue(text, key) {
  const regex = new RegExp(`${key}:\\s*getPublicEnv\\([^)]*\\)|${key}:\\s*['"]([^'"]*?)['"]`);
  const envMatch = text.match(
    new RegExp(`${key}:\\s*getPublicEnv\\(\\s*["']([^"']+)["'](?:,\\s*["']([^"']*)["'])?\\s*\\)`),
  );

  if (envMatch) {
    const envKey = envMatch[1];
    const fallback = envMatch[2] ?? "";
    const fromEnv = process.env[envKey];
    if (typeof fromEnv === "string" && fromEnv.trim()) {
      return fromEnv.trim();
    }
    return fallback;
  }

  const match = text.match(new RegExp(`${key}:\\s*['"]([^'"]*?)['"]`));
  return match ? match[1] : "";
}

function extractNestedString(text, parentKey, childKey) {
  const parentMatch = text.match(
    new RegExp(`${parentKey}:\\s*\\{([\\s\\S]*?)\\n  \\}`),
  );
  if (!parentMatch) return "";
  return extractStringValue(parentMatch[1], childKey);
}

function readConfig() {
  const constsPath = path.join(process.cwd(), "src/utils/consts.ts");

  if (!fs.existsSync(constsPath)) {
    throw new Error("Configuration file not found: src/utils/consts.ts");
  }

  const constsContent = fs.readFileSync(constsPath, "utf8");
  const siteConfigMatch = constsContent.match(
    /export const SITE_CONFIG = \{([\s\S]*?)\} as const;/,
  );

  if (!siteConfigMatch) {
    throw new Error("SITE_CONFIG not found in consts.ts");
  }

  const body = siteConfigMatch[1];

  return {
    SITE_CONFIG: {
      name: extractStringValue(body, "name"),
      title: extractStringValue(body, "title"),
      description: extractStringValue(body, "description"),
      url: extractStringValue(body, "url") || "https://metric.graphics",
      phone: extractStringValue(body, "phone"),
      email: extractStringValue(body, "email"),
      themeColor: extractStringValue(body, "themeColor"),
      defaultLocale: extractStringValue(body, "defaultLocale"),
      analytics: {
        yandexMetrikaId: extractNestedString(body, "analytics", "yandexMetrikaId"),
        googleAnalyticsId: extractNestedString(body, "analytics", "googleAnalyticsId"),
        googleTagManagerId: extractNestedString(body, "analytics", "googleTagManagerId"),
      },
      seo: {
        googleSiteVerification: extractNestedString(
          body,
          "seo",
          "googleSiteVerification",
        ),
        yandexSiteVerification: extractNestedString(
          body,
          "seo",
          "yandexSiteVerification",
        ),
      },
      build: {
        staticFilesDir: extractNestedString(body, "build", "staticFilesDir") || "public",
      },
    },
  };
}

function getConfig() {
  try {
    const config = readConfig();
    console.log("Configuration loaded from src/utils/consts.ts");
    console.log(`Site URL: ${config.SITE_CONFIG.url}`);
    return config;
  } catch (error) {
    console.error("Failed to read configuration:", error.message);
    throw error;
  }
}

module.exports = { getConfig, readConfig };
