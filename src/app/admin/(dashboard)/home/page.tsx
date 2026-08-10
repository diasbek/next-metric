import { requirePermission } from "@/lib/cms/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { HomePageAdmin } from "@/components/admin/page-shell/HomePageAdmin";
import type { WhyUsTitleDraft } from "@/components/admin/page-shell/HomeWhyUsEditor";
import {
  ADMIN_LOCALES,
  type BenefitDraft,
  type ProcessDraft,
} from "@/components/admin/list-cms/types";

function toProcessDraft(row: {
  id: string;
  sort_order: number;
  status: string;
  process_step_translations?: Array<{
    locale: string;
    title: string;
    description: string;
  }>;
}): ProcessDraft {
  const translations = Object.fromEntries(
    ADMIN_LOCALES.map((locale) => {
      const tr = row.process_step_translations?.find((t) => t.locale === locale.code);
      return [
        locale.code,
        {
          locale: locale.code,
          title: tr?.title ?? "",
          description: tr?.description ?? "",
        },
      ];
    }),
  ) as ProcessDraft["translations"];

  return {
    id: row.id,
    sort_order: row.sort_order,
    status: row.status,
    translations,
  };
}

function toBenefitDraft(row: {
  id: string;
  sort_order: number;
  status: string;
  benefit_translations?: Array<{ locale: string; label: string }>;
}): BenefitDraft {
  const translations = Object.fromEntries(
    ADMIN_LOCALES.map((locale) => {
      const tr = row.benefit_translations?.find((t) => t.locale === locale.code);
      return [
        locale.code,
        {
          locale: locale.code,
          label: tr?.label ?? "",
        },
      ];
    }),
  ) as BenefitDraft["translations"];

  return {
    id: row.id,
    sort_order: row.sort_order,
    status: row.status,
    translations,
  };
}

const DEFAULT_WHY_US: WhyUsTitleDraft = {
  en: { titleLine1: "Why choose", titleLine2: "us" },
  de: { titleLine1: "Warum uns", titleLine2: "wählen" },
};

export default async function AdminHomePageEditor({
  searchParams,
}: {
  searchParams: Promise<{ section?: string; edit?: string; saved?: string }>;
}) {
  await requirePermission("content");
  const params = await searchParams;
  const section = params.section ?? "process";
  const supabase = createSupabaseAdminClient();

  let process: ProcessDraft[] = [];
  let benefits: BenefitDraft[] = [];
  const whyUsTitles = structuredClone(DEFAULT_WHY_US);

  if (section === "process") {
    const { data: processRows } = await supabase
      .from("metric_process_steps")
      .select("*, process_step_translations(*)")
      .order("sort_order");
    process = (processRows ?? []).map(toProcessDraft);
  } else {
    const [benefitRes, homeRes] = await Promise.all([
      supabase.from("metric_benefits").select("*, benefit_translations(*)").order("sort_order"),
      supabase.from("metric_home_translations").select("*"),
    ]);
    benefits = (benefitRes.data ?? []).map(toBenefitDraft);
    const homeRows = homeRes.error ? null : homeRes.data;
    for (const row of homeRows ?? []) {
      const locale = row.locale as keyof WhyUsTitleDraft;
      if (!(locale in whyUsTitles)) continue;
      whyUsTitles[locale] = {
        titleLine1: (row.why_us_title_line_1 as string) ?? "",
        titleLine2: (row.why_us_title_line_2 as string) ?? "",
      };
    }
  }

  return (
    <HomePageAdmin
      section={section}
      editId={params.edit ?? null}
      process={process}
      benefits={benefits}
      whyUsTitles={whyUsTitles}
      saved={Boolean(params.saved)}
    />
  );
}
