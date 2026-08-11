import { redirect } from "next/navigation";
import { requirePermission } from "@/lib/cms/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { AgencyPageAdmin } from "@/components/admin/page-shell/AgencyPageAdmin";
import { EMBED } from "@/lib/cms/embeds";
import {
  ADMIN_LOCALES as TEAM_LOCALES,
  type TeamMemberDraft,
} from "@/components/admin/team/types";
import {
  ADMIN_LOCALES as TESTIMONIAL_LOCALES,
  type TestimonialDraft,
} from "@/components/admin/testimonials/types";

function toTeamDraft(row: {
  id: string;
  sort_order: number;
  status: string;
  image: string | null;
  image_object_position: string | null;
  is_director: boolean | null;
  team_member_translations?: Array<{ locale: string; name: string; role: string }>;
}): TeamMemberDraft {
  const translations = Object.fromEntries(
    TEAM_LOCALES.map((locale) => {
      const tr = row.team_member_translations?.find((t) => t.locale === locale.code);
      return [
        locale.code,
        {
          locale: locale.code,
          name: tr?.name ?? "",
          role: tr?.role ?? "",
        },
      ];
    }),
  ) as TeamMemberDraft["translations"];

  return {
    id: row.id,
    sort_order: row.sort_order,
    status: row.status,
    image: row.image ?? "",
    image_object_position: row.image_object_position ?? "",
    is_director: Boolean(row.is_director),
    translations,
  };
}

function toTestimonialDraft(row: {
  id: string;
  sort_order: number;
  status: string;
  person_image: string;
  person_object_position: string | null;
  logo_image: string;
  logo_rounded: string | null;
  testimonial_translations?: Array<{ locale: string; role: string; quote: string }>;
}): TestimonialDraft {
  const translations = Object.fromEntries(
    TESTIMONIAL_LOCALES.map((locale) => {
      const tr = row.testimonial_translations?.find((t) => t.locale === locale.code);
      return [
        locale.code,
        {
          locale: locale.code,
          role: tr?.role ?? "",
          quote: tr?.quote ?? "",
        },
      ];
    }),
  ) as TestimonialDraft["translations"];

  return {
    id: row.id,
    sort_order: row.sort_order,
    status: row.status,
    person_image: row.person_image ?? "",
    person_object_position: row.person_object_position ?? "",
    logo_image: row.logo_image ?? "",
    logo_rounded: row.logo_rounded ?? "",
    translations,
  };
}

export default async function AdminAgencyPage({
  searchParams,
}: {
  searchParams: Promise<{ section?: string; edit?: string; saved?: string }>;
}) {
  await requirePermission("content");
  const params = await searchParams;
  const section = params.section ?? "about";

  if (section === "faq") {
    const edit = params.edit ? `&edit=${encodeURIComponent(params.edit)}` : "";
    redirect(`/admin/metric-home/?section=faq${edit}`);
  }

  const supabase = createSupabaseAdminClient();
  const locales = ["en", "de"] as const;

  const emptyAboutTranslations = Object.fromEntries(
    locales.map((locale) => [
      locale,
      { titleLine1: "", titleLine2: "", paragraphs: "", stats: "" },
    ]),
  ) as Parameters<typeof AgencyPageAdmin>[0]["about"]["translations"];

  let foundedYear = "2019";
  let aboutTranslations = emptyAboutTranslations;
  let team: ReturnType<typeof toTeamDraft>[] = [];
  let testimonials: ReturnType<typeof toTestimonialDraft>[] = [];

  if (section === "about") {
    const [{ data: content }, { data: translations }] = await Promise.all([
      supabase.from("metric_agency_content").select("*").eq("id", 1).maybeSingle(),
      supabase.from("metric_agency_translations").select("*"),
    ]);
    foundedYear = content?.founded_year ?? "2019";
    aboutTranslations = Object.fromEntries(
      locales.map((locale) => {
        const tr = translations?.find((t) => t.locale === locale);
        const stats = Array.isArray(tr?.stats)
          ? (tr.stats as { value: string; label: string }[])
              .map((s) => `${s.value}|${s.label}`)
              .join("\n")
          : "";
        return [
          locale,
          {
            titleLine1: tr?.title_line_1 ?? "",
            titleLine2: tr?.title_line_2 ?? "",
            paragraphs: Array.isArray(tr?.paragraphs)
              ? (tr.paragraphs as string[]).join("\n")
              : "",
            stats,
          },
        ];
      }),
    ) as Parameters<typeof AgencyPageAdmin>[0]["about"]["translations"];
  } else if (section === "team") {
    const { data: teamRows } = await supabase
      .from("metric_team_members")
      .select(`*, ${EMBED.teamMemberTranslations}`)
      .order("sort_order");
    team = (teamRows ?? []).map(toTeamDraft);
  } else if (section === "testimonials") {
    const { data: testimonialRows } = await supabase
      .from("metric_testimonials")
      .select(`*, ${EMBED.testimonialTranslations}`)
      .order("sort_order");
    testimonials = (testimonialRows ?? []).map(toTestimonialDraft);
  }

  return (
    <AgencyPageAdmin
      section={section}
      editId={params.edit ?? null}
      about={{
        foundedYear,
        translations: aboutTranslations,
        saved: params.saved === "1",
      }}
      team={team}
      testimonials={testimonials}
    />
  );
}
