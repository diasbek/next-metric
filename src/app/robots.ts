import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import {
  getCanonicalSiteUrl,
  isIndexableDeployment,
  isStagingHost,
} from "@/utils/seo/indexing";

async function requestHost(): Promise<string | null> {
  try {
    const headerList = await headers();
    const raw =
      headerList.get("x-forwarded-host") ?? headerList.get("host") ?? "";
    return raw.split(",")[0]?.trim() || null;
  } catch {
    return null;
  }
}

export default async function robots(): Promise<MetadataRoute.Robots> {
  const host = await requestHost();

  if (!isIndexableDeployment() || isStagingHost(host)) {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    };
  }

  const siteUrl = getCanonicalSiteUrl();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/api/"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
