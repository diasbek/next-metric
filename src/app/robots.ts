import type { MetadataRoute } from "next";
import {
  getCanonicalSiteUrl,
  isIndexableDeployment,
} from "@/utils/seo/indexing";

export default function robots(): MetadataRoute.Robots {
  if (!isIndexableDeployment()) {
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
