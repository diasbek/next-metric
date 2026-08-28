import { createSupabasePublicClient, hasSupabasePublicConfig } from "@/lib/supabase/public";
import type { Locale } from "@/i18n/config";
import type { Service } from "@/data/services";
import type { FAQItem } from "@/data/faq";
import type { Testimonial } from "@/data/agency";
import { coalesceLocalized, pickTranslationRow } from "@/lib/cms/locale-fallback";
import { unstable_cache } from "next/cache";

async function loadExtras(locale: Locale) {
  if (!hasSupabasePublicConfig()) return null;

  try {
    const supabase = createSupabasePublicClient();
    if (!supabase) return null;

    const [
      servicesRes,
      faqRes,
      teamRes,
      testimonialsRes,
      agencyRes,
      agencyTrRes,
      settingsRes,
      settingsTrRes,
      seoRes,
    ] = await Promise.all([
        supabase
          .from("metric_services")
          .select("*, service_translations:metric_service_translations(*)")
          .eq("status", "published")
          .order("sort_order"),
        supabase
          .from("metric_faq_items")
          .select("*, faq_translations:metric_faq_translations(*)")
          .eq("status", "published")
          .order("sort_order"),
        supabase
          .from("metric_team_members")
          .select("*, team_member_translations:metric_team_member_translations(*)")
          .eq("status", "published")
          .order("sort_order"),
        supabase
          .from("metric_testimonials")
          .select("*, testimonial_translations:metric_testimonial_translations(*)")
          .eq("status", "published")
          .order("sort_order"),
        supabase.from("metric_agency_content").select("*").eq("id", 1).maybeSingle(),
        supabase.from("metric_agency_translations").select("*").eq("locale", locale).maybeSingle(),
        supabase
          .from("metric_site_settings")
          .select(
            "phone, email, telegram_url, instagram_url, presentation_url, brief_url, address_lines",
          )
          .eq("id", 1)
          .maybeSingle(),
        supabase
          .from("metric_site_settings_translations")
          .select("address_lines, presentation_url, brief_url")
          .eq("locale", locale)
          .maybeSingle(),
        supabase.from("metric_page_seo").select("*").eq("locale", locale),
      ]);

    if (servicesRes.error) return null;

    const services: Service[] = (servicesRes.data ?? [])
      .map((row) => {
        const { primary, en } = pickTranslationRow(
          row.service_translations as Array<{ locale?: string }> | undefined,
          locale,
        );
        const tr = primary ?? en;
        if (!tr) return null;
        return {
          id: row.service_key,
          title: coalesceLocalized(
            (primary as { title?: string } | undefined)?.title,
            (en as { title?: string } | undefined)?.title,
          ),
          shortDescription: coalesceLocalized(
            (primary as { short_description?: string } | undefined)?.short_description,
            (en as { short_description?: string } | undefined)?.short_description,
          ),
          fullDescription: coalesceLocalized(
            (primary as { full_description?: string } | undefined)?.full_description,
            (en as { full_description?: string } | undefined)?.full_description,
          ),
          price: coalesceLocalized(
            (primary as { price?: string } | undefined)?.price,
            (en as { price?: string } | undefined)?.price,
          ),
          duration: coalesceLocalized(
            (primary as { duration?: string } | undefined)?.duration,
            (en as { duration?: string } | undefined)?.duration,
          ),
        } satisfies Service;
      })
      .filter(Boolean) as Service[];

    const faq: FAQItem[] = (faqRes.data ?? [])
      .map((row) => {
        const { primary, en } = pickTranslationRow(
          row.faq_translations as Array<{ locale?: string }> | undefined,
          locale,
        );
        if (!primary && !en) return null;
        return {
          question: coalesceLocalized(
            (primary as { question?: string } | undefined)?.question,
            (en as { question?: string } | undefined)?.question,
          ),
          answer: coalesceLocalized(
            (primary as { answer?: string } | undefined)?.answer,
            (en as { answer?: string } | undefined)?.answer,
          ),
        };
      })
      .filter(Boolean) as FAQItem[];

    const directorRow = (teamRes.data ?? []).find((m) => m.is_director);
    const team = (teamRes.data ?? [])
      .filter((m) => !m.is_director)
      .map((row) => {
        const { primary, en } = pickTranslationRow(
          row.team_member_translations as Array<{ locale?: string }> | undefined,
          locale,
        );
        if (!primary && !en) return null;
        return {
          name: coalesceLocalized(
            (primary as { name?: string } | undefined)?.name,
            (en as { name?: string } | undefined)?.name,
          ),
          role: coalesceLocalized(
            (primary as { role?: string } | undefined)?.role,
            (en as { role?: string } | undefined)?.role,
          ),
          image: row.image,
          imageObjectPosition: row.image_object_position ?? undefined,
        };
      })
      .filter(Boolean) as Array<{
      name: string;
      role: string;
      image: string;
      imageObjectPosition?: string;
    }>;

    let director = {
      name: "",
      role: "",
      image: "",
      imageObjectPosition: undefined as string | undefined,
    };
    if (directorRow) {
      const { primary, en } = pickTranslationRow(
        directorRow.team_member_translations as Array<{ locale?: string }> | undefined,
        locale,
      );
      if (primary || en) {
        director = {
          name: coalesceLocalized(
            (primary as { name?: string } | undefined)?.name,
            (en as { name?: string } | undefined)?.name,
          ),
          role: coalesceLocalized(
            (primary as { role?: string } | undefined)?.role,
            (en as { role?: string } | undefined)?.role,
          ),
          image: directorRow.image,
          imageObjectPosition: directorRow.image_object_position ?? undefined,
        };
      }
    }

    const testimonials: Testimonial[] = (testimonialsRes.data ?? [])
      .map((row) => {
        const { primary, en } = pickTranslationRow(
          row.testimonial_translations as Array<{ locale?: string }> | undefined,
          locale,
        );
        if (!primary && !en) return null;
        return {
          role: coalesceLocalized(
            (primary as { role?: string } | undefined)?.role,
            (en as { role?: string } | undefined)?.role,
          ),
          quote: coalesceLocalized(
            (primary as { quote?: string } | undefined)?.quote,
            (en as { quote?: string } | undefined)?.quote,
          ),
          personImage: row.person_image,
          personObjectPosition: row.person_object_position ?? undefined,
          logoImage: row.logo_image,
          logoRounded: row.logo_rounded as "full" | "lg" | undefined,
        };
      })
      .filter(Boolean) as Testimonial[];

    const agencyTr = agencyTrRes.data;
    const agencyContent = agencyRes.data;
    let agencyEn: typeof agencyTr = null;
    let settingsTrEn: typeof settingsTrRes.data = null;
    let seoEnRows: typeof seoRes.data = null;
    if (locale === "de") {
      const [agencyEnRes, settingsEnRes, seoEnRes] = await Promise.all([
        supabase.from("metric_agency_translations").select("*").eq("locale", "en").maybeSingle(),
        supabase
          .from("metric_site_settings_translations")
          .select("address_lines, presentation_url, brief_url")
          .eq("locale", "en")
          .maybeSingle(),
        supabase.from("metric_page_seo").select("*").eq("locale", "en"),
      ]);
      agencyEn = agencyEnRes.data;
      settingsTrEn = settingsEnRes.data;
      seoEnRows = seoEnRes.data;
    }

    const pageSeo: Record<
      string,
      {
        title: string;
        description: string;
        keywords: string;
        ogImage: string;
        noindex: boolean;
      }
    > = {};
    const seoEnByKey = new Map(
      (seoEnRows ?? []).map((row) => [row.page_key as string, row]),
    );
    for (const row of seoRes.data ?? []) {
      const en = seoEnByKey.get(row.page_key);
      pageSeo[row.page_key] = {
        title: coalesceLocalized(row.title, en?.title),
        description: coalesceLocalized(row.description, en?.description),
        keywords: coalesceLocalized(row.keywords, en?.keywords),
        ogImage: coalesceLocalized(row.og_image, en?.og_image),
        noindex: Boolean(row.noindex),
      };
    }
    if (locale === "de") {
      for (const [key, en] of seoEnByKey) {
        if (pageSeo[key]) continue;
        pageSeo[key] = {
          title: coalesceLocalized(en.title),
          description: coalesceLocalized(en.description),
          keywords: coalesceLocalized(en.keywords),
          ogImage: coalesceLocalized(en.og_image),
          noindex: Boolean(en.noindex),
        };
      }
    }

    return {
      services,
      faq,
      agency: {
        about: {
          title: coalesceLocalized(agencyTr?.title, agencyEn?.title),
          titleLines: [
            coalesceLocalized(agencyTr?.title_line_1, agencyEn?.title_line_1),
            coalesceLocalized(agencyTr?.title_line_2, agencyEn?.title_line_2),
          ] as [string, string],
          paragraphs: (() => {
            const primary = (agencyTr?.paragraphs as string[] | undefined) ?? [];
            const fallback = (agencyEn?.paragraphs as string[] | undefined) ?? [];
            if (!primary.length) return fallback;
            return primary.map((line, i) => coalesceLocalized(line, fallback[i]));
          })(),
        },
        foundedYear: agencyContent?.founded_year ?? "2019",
        stats: (() => {
          const primary =
            (agencyTr?.stats as { value: string; label: string }[] | undefined) ?? [];
          const fallback =
            (agencyEn?.stats as { value: string; label: string }[] | undefined) ?? [];
          if (!primary.length) return fallback;
          return primary.map((stat, i) => ({
            value: coalesceLocalized(stat.value, fallback[i]?.value),
            label: coalesceLocalized(stat.label, fallback[i]?.label),
          }));
        })(),
        director,
        team,
        testimonials,
      },
      siteSettings: settingsRes.data
        ? {
            ...settingsRes.data,
            presentation_url:
              coalesceLocalized(
                settingsTrRes.data?.presentation_url,
                settingsTrEn?.presentation_url,
                settingsRes.data.presentation_url,
              ),
            brief_url: coalesceLocalized(
              settingsTrRes.data?.brief_url,
              settingsTrEn?.brief_url,
              settingsRes.data.brief_url,
            ),
            address_lines:
              settingsTrRes.data?.address_lines?.length
                ? settingsTrRes.data.address_lines
                : settingsTrEn?.address_lines?.length
                  ? settingsTrEn.address_lines
                  : settingsRes.data.address_lines,
          }
        : null,
      pageSeo,
    };
  } catch {
    return null;
  }
}

export const getCmsExtras = (locale: Locale) =>
  unstable_cache(() => loadExtras(locale), ["cms-extras", locale], {
    tags: [
      "cms",
      "services",
      "faq",
      "home",
      "team",
      "testimonials",
      "agency",
      "page_seo",
      "site_settings",
    ],
    revalidate: false,
  })();
