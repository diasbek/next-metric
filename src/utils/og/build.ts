import type { Locale } from "@/i18n/config";
import {
  ogEyebrows,
  type OgPageKey,
} from "@/utils/og/paths";
import { getImageDataUrl } from "@/utils/og/render";
import type { OgTemplateProps } from "@/utils/og/template";

export type OgRenderInput = Omit<OgTemplateProps, "logoDataUrl">;

function siteHostname(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return "metric.graphics";
  }
}

export function resolveOgSiteHostname(siteUrl?: string): string {
  if (!siteUrl?.trim()) return "metric.graphics";
  if (!/^https?:\/\//i.test(siteUrl)) return siteUrl.replace(/\/$/, "");
  return siteHostname(siteUrl);
}

/** Strip trailing brand suffix used in SEO titles. */
export function stripMetricTitleSuffix(title: string): string {
  return title.replace(/\s*—\s*METRIC$/i, "").trim();
}

export async function buildCaseOgProps(input: {
  title: string;
  description: string;
  coverUrl?: string | null;
  locale: Locale;
  siteUrl?: string;
}): Promise<OgRenderInput> {
  const title =
    stripMetricTitleSuffix(input.title) ||
    input.title.trim() ||
    "METRIC";
  return {
    title,
    description: input.description.trim(),
    eyebrow: ogEyebrows[input.locale].works,
    imageDataUrl: await getImageDataUrl(input.coverUrl),
    siteUrl: resolveOgSiteHostname(input.siteUrl),
  };
}

export async function buildPageOgProps(input: {
  pageKey: OgPageKey;
  title: string;
  description: string;
  locale: Locale;
  siteUrl?: string;
}): Promise<OgRenderInput> {
  return {
    title: stripMetricTitleSuffix(input.title) || input.title.trim() || "METRIC",
    description: input.description.trim(),
    eyebrow: ogEyebrows[input.locale][input.pageKey],
    siteUrl: resolveOgSiteHostname(input.siteUrl),
  };
}
