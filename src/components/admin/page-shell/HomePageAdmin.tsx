"use client";

/**
 * @deprecated Legacy Timsol-style process / why-us homepage editor.
 * Metric home content lives at `/admin/metric-home/`. Routes under
 * `/admin/home|process|benefits` redirect there.
 */
import dynamic from "next/dynamic";
import Link from "next/link";
import type { BenefitDraft, ProcessDraft } from "@/components/admin/list-cms/types";
import { AdminPageShell } from "@/components/admin/page-shell/AdminPageShell";
import type { WhyUsTitleDraft } from "@/components/admin/page-shell/HomeWhyUsEditor";
import { adminBtn } from "@/components/admin/ui/styles";
import { useAdminT } from "@/i18n/admin";

const ProcessEditor = dynamic(
  () =>
    import("@/components/admin/list-cms/ProcessEditor").then(
      (m) => m.ProcessEditor,
    ),
  { ssr: false },
);
const HomeWhyUsEditor = dynamic(
  () =>
    import("@/components/admin/page-shell/HomeWhyUsEditor").then(
      (m) => m.HomeWhyUsEditor,
    ),
  { ssr: false },
);

type Props = {
  section: string;
  editId?: string | null;
  process: ProcessDraft[];
  benefits: BenefitDraft[];
  whyUsTitles: WhyUsTitleDraft;
  saved?: boolean;
};

export function HomePageAdmin({
  section,
  editId,
  process,
  benefits,
  whyUsTitles,
  saved = false,
}: Props) {
  const t = useAdminT();
  const sections = [
    { id: "process", label: t.pages.process.title },
    { id: "benefits", label: t.pages.benefits.title },
  ];
  const active = sections.some((s) => s.id === section) ? section : "process";

  return (
    <AdminPageShell
      title={t.pages.home.title}
      publicPath="/"
      description={t.pages.home.description}
      sections={sections}
      activeSection={active}
      basePath="/admin/home/"
      extra={
        <div
          style={{
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
            marginBottom: 20,
            padding: 14,
            border: "1px solid #333",
            background: "#0c0c0c",
          }}
        >
          <span style={{ fontSize: 13, color: "#888", alignSelf: "center" }}>
            {t.pages.home.alsoOnHome}
          </span>
          <Link href="/admin/works/" style={{ ...adminBtn, textDecoration: "none" }}>
            {t.pages.works.title} →
          </Link>
          <Link href="/admin/services/" style={{ ...adminBtn, textDecoration: "none" }}>
            {t.pages.services.title} →
          </Link>
        </div>
      }
    >
      {active === "process" ? (
        <ProcessEditor items={process} initialEditId={editId} embedded />
      ) : null}
      {active === "benefits" ? (
        <HomeWhyUsEditor
          titles={whyUsTitles}
          benefits={benefits}
          initialEditId={editId}
          saved={saved}
        />
      ) : null}
    </AdminPageShell>
  );
}
