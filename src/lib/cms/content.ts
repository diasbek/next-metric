import { createSupabasePublicClient, hasSupabasePublicConfig } from "@/lib/supabase/public";
import type { Locale } from "@/i18n/config";
import type { Service } from "@/data/services";
import type { FAQItem } from "@/data/faq";
import type { ProcessStep } from "@/data/process";
import type { Testimonial } from "@/data/agency";
import { unstable_cache } from "next/cache";

async function loadExtras(locale: Locale) {
  if (!hasSupabasePublicConfig()) return null;

  try {
    const supabase = createSupabasePublicClient();
    if (!supabase) return null;

    const [
      servicesRes,
      faqRes,
      processRes,
      benefitsRes,
      teamRes,
      testimonialsRes,
      agencyRes,
      agencyTrRes,
      homeTrRes,
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
          .from("metric_process_steps")
          .select("*, process_step_translations:metric_process_step_translations(*)")
          .eq("status", "published")
          .order("sort_order"),
        supabase
          .from("metric_benefits")
          .select("*, benefit_translations:metric_benefit_translations(*)")
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
        supabase.from("metric_home_translations").select("*").eq("locale", locale).maybeSingle(),
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
        const tr =
          row.service_translations?.find((t: { locale: string }) => t.locale === locale) ??
          row.service_translations?.[0];
        if (!tr) return null;
        return {
          id: row.service_key,
          title: tr.title,
          shortDescription: tr.short_description,
          fullDescription: tr.full_description,
          price: tr.price,
          duration: tr.duration,
        } satisfies Service;
      })
      .filter(Boolean) as Service[];

    const faq: FAQItem[] = (faqRes.data ?? [])
      .map((row) => {
        const tr =
          row.faq_translations?.find((t: { locale: string }) => t.locale === locale) ??
          row.faq_translations?.[0];
        if (!tr) return null;
        return { question: tr.question, answer: tr.answer };
      })
      .filter(Boolean) as FAQItem[];

    const processSteps: ProcessStep[] = (processRes.data ?? [])
      .map((row) => {
        const tr =
          row.process_step_translations?.find((t: { locale: string }) => t.locale === locale) ??
          row.process_step_translations?.[0];
        if (!tr) return null;
        return {
          number: row.step_number,
          title: tr.title,
          description: tr.description,
        };
      })
      .filter(Boolean) as ProcessStep[];

    const benefits: string[] = (benefitsRes.data ?? [])
      .map((row) => {
        const tr =
          row.benefit_translations?.find((t: { locale: string }) => t.locale === locale) ??
          row.benefit_translations?.[0];
        return tr?.label;
      })
      .filter(Boolean) as string[];

    const directorRow = (teamRes.data ?? []).find((m) => m.is_director);
    const team = (teamRes.data ?? [])
      .filter((m) => !m.is_director)
      .map((row) => {
        const tr =
          row.team_member_translations?.find((t: { locale: string }) => t.locale === locale) ??
          row.team_member_translations?.[0];
        if (!tr) return null;
        return {
          name: tr.name,
          role: tr.role,
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
      const tr =
        directorRow.team_member_translations?.find((t: { locale: string }) => t.locale === locale) ??
        directorRow.team_member_translations?.[0];
      if (tr) {
        director = {
          name: tr.name,
          role: tr.role,
          image: directorRow.image,
          imageObjectPosition: directorRow.image_object_position ?? undefined,
        };
      }
    }

    const testimonials: Testimonial[] = (testimonialsRes.data ?? [])
      .map((row) => {
        const tr =
          row.testimonial_translations?.find((t: { locale: string }) => t.locale === locale) ??
          row.testimonial_translations?.[0];
        if (!tr) return null;
        return {
          role: tr.role,
          quote: tr.quote,
          personImage: row.person_image,
          personObjectPosition: row.person_object_position ?? undefined,
          logoImage: row.logo_image,
          logoRounded: row.logo_rounded as "full" | "lg" | undefined,
        };
      })
      .filter(Boolean) as Testimonial[];

    const agencyTr = agencyTrRes.data;
    const agencyContent = agencyRes.data;
    const homeTr = homeTrRes.data;

    const pageSeo: Record<
      string,
      { title: string; description: string; keywords: string }
    > = {};
    for (const row of seoRes.data ?? []) {
      pageSeo[row.page_key] = {
        title: row.title,
        description: row.description,
        keywords: row.keywords ?? "",
      };
    }

    return {
      services,
      faq,
      processSteps,
      benefits,
      whyUsTitleLines: [
        homeTr?.why_us_title_line_1 ?? "",
        homeTr?.why_us_title_line_2 ?? "",
      ] as [string, string],
      agency: {
        about: {
          title: agencyTr?.title ?? "",
          titleLines: [agencyTr?.title_line_1 ?? "", agencyTr?.title_line_2 ?? ""] as [
            string,
            string,
          ],
          paragraphs: (agencyTr?.paragraphs as string[]) ?? [],
        },
        foundedYear: agencyContent?.founded_year ?? "2019",
        stats: (agencyTr?.stats as { value: string; label: string }[]) ?? [],
        director,
        team,
        testimonials,
      },
      siteSettings: settingsRes.data
        ? {
            ...settingsRes.data,
            presentation_url:
              settingsTrRes.data?.presentation_url ||
              settingsRes.data.presentation_url,
            brief_url:
              settingsTrRes.data?.brief_url || settingsRes.data.brief_url,
            address_lines:
              settingsTrRes.data?.address_lines?.length
                ? settingsTrRes.data.address_lines
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
      "process",
      "benefits",
      "home",
      "team",
      "testimonials",
      "agency",
      "page_seo",
      "site_settings",
    ],
    revalidate: false,
  })();
