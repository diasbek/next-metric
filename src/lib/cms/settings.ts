import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseAdminConfig } from "@/lib/supabase/env";
import type { DbSiteSettings } from "@/lib/cms/types";
import { parseSiteVerificationToken, parseYandexMetrikaId } from "@/lib/cms/verification";
import { unstable_cache } from "next/cache";
import { getPublicEnv } from "@/utils/env";

async function loadSiteSettings(): Promise<DbSiteSettings | null> {
  if (!hasSupabaseAdminConfig()) return null;
  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("metric_site_settings")
      .select("*")
      .eq("id", 1)
      .maybeSingle();
    if (error) return null;
    return data as DbSiteSettings | null;
  } catch {
    return null;
  }
}

export const getSiteSettings = unstable_cache(loadSiteSettings, ["site-settings"], {
  tags: ["cms", "site_settings"],
  revalidate: false,
});

/** Public-safe captcha config (no secrets). */
export type PublicCaptchaConfig = {
  provider: DbSiteSettings["captcha_provider"];
  siteKey: string;
};

export async function getPublicCaptchaConfig(): Promise<PublicCaptchaConfig> {
  const settings = await getSiteSettings();
  const provider = settings?.captcha_provider ?? "none";
  if (provider === "none" || provider === "honeypot") {
    return { provider, siteKey: "" };
  }
  return {
    provider,
    siteKey: settings?.captcha_site_key ?? "",
  };
}

export type ResolvedAnalytics = {
  yandexMetrikaId: string;
  googleAnalyticsId: string;
  googleTagManagerId: string;
  googleSiteVerification: string;
  yandexWebmasterVerification: string;
};

export async function getResolvedAnalytics(): Promise<ResolvedAnalytics> {
  const settings = await getSiteSettings();
  return {
    yandexMetrikaId:
      parseYandexMetrikaId(settings?.yandex_metrika_id) ||
      parseYandexMetrikaId(getPublicEnv("NEXT_PUBLIC_YM_ID")),
    googleAnalyticsId:
      settings?.google_analytics_id?.trim() ||
      getPublicEnv("NEXT_PUBLIC_GA_ID"),
    googleTagManagerId:
      settings?.google_tag_manager_id?.trim() ||
      getPublicEnv("NEXT_PUBLIC_GTM_ID"),
    googleSiteVerification:
      parseSiteVerificationToken(settings?.google_site_verification) ||
      parseSiteVerificationToken(
        getPublicEnv("NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION"),
      ),
    yandexWebmasterVerification:
      parseSiteVerificationToken(settings?.yandex_webmaster_verification) ||
      parseSiteVerificationToken(
        getPublicEnv("NEXT_PUBLIC_YANDEX_SITE_VERIFICATION"),
      ),
  };
}
