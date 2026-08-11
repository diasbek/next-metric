import { requirePermission } from "@/lib/cms/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getMetricHome, toMetricHomePayload } from "@/data/metric-home";
import { MetricHomeAdmin } from "@/components/admin/page-shell/MetricHomeAdmin";
import {
  ADMIN_LOCALES,
  type FaqDraft,
} from "@/components/admin/list-cms/types";
import { EMBED } from "@/lib/cms/embeds";

function toFaqDraft(row: {
  id: string;
  sort_order: number;
  status: string;
  faq_translations?: Array<{ locale: string; question: string; answer: string }>;
}): FaqDraft {
  const translations = Object.fromEntries(
    ADMIN_LOCALES.map((locale) => {
      const tr = row.faq_translations?.find((t) => t.locale === locale.code);
      return [
        locale.code,
        {
          locale: locale.code,
          question: tr?.question ?? "",
          answer: tr?.answer ?? "",
        },
      ];
    }),
  ) as FaqDraft["translations"];

  return {
    id: row.id,
    sort_order: row.sort_order,
    status: row.status,
    translations,
  };
}

export default async function AdminHomePage({
  searchParams,
}: {
  searchParams: Promise<{
    section?: string;
    saved?: string;
    edit?: string;
  }>;
}) {
  await requirePermission("content");
  const params = await searchParams;
  const section = params.section ?? "hero";
  const supabase = createSupabaseAdminClient();

  const [{ data: home }, { data: translations }, { data: projectRows }, faqRes] =
    await Promise.all([
      supabase.from("metric_home").select("status").eq("id", 1).maybeSingle(),
      supabase.from("metric_home_translations").select("locale, payload"),
      supabase
        .from("metric_projects")
        .select(`slug, status, ${EMBED.projectTranslations}`)
        .order("sort_order"),
      section === "faq"
        ? supabase
            .from("metric_faq_items")
            .select(`*, ${EMBED.faqTranslations}`)
            .order("sort_order")
        : Promise.resolve({ data: null }),
    ]);

  const byLocale = Object.fromEntries(
    (translations ?? []).map((row) => [row.locale, row.payload]),
  ) as Record<string, unknown>;

  const enPayload =
    byLocale.en && typeof byLocale.en === "object"
      ? (byLocale.en as Record<string, unknown>)
      : toMetricHomePayload(getMetricHome("en"));
  const dePayload =
    byLocale.de && typeof byLocale.de === "object"
      ? (byLocale.de as Record<string, unknown>)
      : toMetricHomePayload(getMetricHome("de"));

  const projects = (projectRows ?? [])
    .filter((row) => row.slug)
    .map((row) => {
      const translationsList = Array.isArray(row.project_translations)
        ? row.project_translations
        : [];
      const enTitle = translationsList.find(
        (tr: { locale?: string; title?: string }) => tr.locale === "en",
      )?.title;
      const anyTitle = translationsList[0]?.title;
      return {
        slug: String(row.slug),
        title: String(enTitle || anyTitle || row.slug),
      };
    });

  const faq = (faqRes.data ?? []).map(toFaqDraft);

  return (
    <MetricHomeAdmin
      section={section}
      status={(home?.status as "draft" | "published") ?? "published"}
      payloads={{ en: enPayload, de: dePayload }}
      projects={projects}
      faq={faq}
      faqEditId={params.edit ?? null}
      saved={Boolean(params.saved)}
    />
  );
}
