"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { AdminPageShell } from "@/components/admin/page-shell/AdminPageShell";
import type { TeamMemberDraft } from "@/components/admin/team/types";
import type { TestimonialDraft } from "@/components/admin/testimonials/types";
import { adminBtn } from "@/components/admin/ui/styles";
import { useAdminT } from "@/i18n/admin";

const AgencyEditor = dynamic(
  () =>
    import("@/app/admin/(dashboard)/agency/AgencyEditor").then(
      (m) => m.AgencyEditor,
    ),
  { ssr: false },
);
const TeamEditor = dynamic(
  () => import("@/components/admin/team").then((m) => m.TeamEditor),
  { ssr: false },
);
const TestimonialsEditor = dynamic(
  () =>
    import("@/components/admin/testimonials/TestimonialsEditor").then(
      (m) => m.TestimonialsEditor,
    ),
  { ssr: false },
);

type LocaleCode = "en" | "de";
type LocaleDraft = {
  titleLine1: string;
  titleLine2: string;
  paragraphs: string;
  stats: string;
};

type Props = {
  section: string;
  editId?: string | null;
  about: {
    foundedYear: string;
    translations: Record<LocaleCode, LocaleDraft>;
    saved?: boolean;
  };
  team: TeamMemberDraft[];
  testimonials: TestimonialDraft[];
};

export function AgencyPageAdmin({
  section,
  editId,
  about,
  team,
  testimonials,
}: Props) {
  const t = useAdminT();
  const sections = [
    { id: "about", label: t.pages.agency.sectionAbout },
    { id: "team", label: t.pages.team.title },
    { id: "testimonials", label: t.pages.testimonials.title },
  ];
  const active = sections.some((s) => s.id === section) ? section : "about";

  return (
    <AdminPageShell
      title={t.pages.agency.title}
      publicPath="/agency/"
      description={t.pages.agency.description}
      sections={sections}
      activeSection={active}
      basePath="/admin/agency/"
      extra={
        <p style={{ margin: "0 0 16px", fontSize: 13, color: "#888" }}>
          {t.pages.agency.faqHomeHint}{" "}
          <Link
            href="/admin/metric-home/?section=faq"
            style={{ ...adminBtn, textDecoration: "none", display: "inline-flex" }}
          >
            {t.pages.faq.title}
          </Link>
        </p>
      }
    >
      {active === "about" ? (
        <AgencyEditor
          foundedYear={about.foundedYear}
          translations={about.translations}
          saved={about.saved}
          embedded
        />
      ) : null}
      {active === "team" ? (
        <TeamEditor items={team} initialEditId={editId} embedded />
      ) : null}
      {active === "testimonials" ? (
        <TestimonialsEditor items={testimonials} initialEditId={editId} embedded />
      ) : null}
    </AdminPageShell>
  );
}
