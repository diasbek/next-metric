"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { HardNavForm } from "@/components/admin/HardNavForm";
import { AdminPageShell } from "@/components/admin/page-shell/AdminPageShell";
import { ADMIN_LOCALES, type AdminLocale } from "@/components/admin/ui/locales";
import { adminBtnPrimary } from "@/components/admin/ui/styles";
import { saveMetricHomeAction } from "@/app/admin/(dashboard)/metric-home/actions";
import type { FaqDraft } from "@/components/admin/list-cms/types";
import {
  isMetricHomeSection,
  type MetricHomeSectionId,
} from "@/components/admin/metric-home/helpers";
import {
  AdvancedJsonEditor,
  CaseStudiesSectionEditor,
  CategoriesSectionEditor,
  FaqChromeEditor,
  HeroSectionEditor,
  HomeServicesSectionEditor,
  NavFooterSectionEditor,
  PublishBar,
  SaveButton,
  TrustSectionEditor,
  WorkflowSectionEditor,
  type ProjectOption,
} from "@/components/admin/metric-home/MetricHomeSectionEditors";
import { useAdminT } from "@/i18n/admin";

const FaqEditor = dynamic(
  () =>
    import("@/components/admin/list-cms/FaqEditor").then((m) => m.FaqEditor),
  { ssr: false },
);

type Props = {
  section: string;
  status: "draft" | "published";
  payloads: { en: Record<string, unknown>; de: Record<string, unknown> };
  projects: ProjectOption[];
  faq: FaqDraft[];
  faqEditId?: string | null;
  saved?: boolean;
};

export function MetricHomeAdmin({
  section,
  status,
  payloads,
  projects,
  faq,
  faqEditId = null,
  saved = false,
}: Props) {
  const t = useAdminT();
  const [locale, setLocale] = useState<AdminLocale>("en");
  const [publishStatus, setPublishStatus] = useState(status);
  const [drafts, setDrafts] = useState(payloads);
  const [jsonDraft, setJsonDraft] = useState(() =>
    JSON.stringify(payloads.en, null, 2),
  );

  const sections = [
    { id: "hero", label: t.pages.home.sectionHero },
    { id: "trust", label: t.pages.home.sectionTrust },
    { id: "categories", label: t.pages.home.sectionCategories },
    { id: "case-studies", label: t.pages.home.sectionCaseStudies },
    { id: "services", label: t.pages.home.sectionServices },
    { id: "workflow", label: t.pages.home.sectionWorkflow },
    { id: "faq", label: t.pages.home.sectionFaq },
    { id: "nav-footer", label: t.pages.home.sectionNavFooter },
    { id: "advanced", label: t.pages.home.sectionAdvanced },
  ];

  const active: MetricHomeSectionId = isMetricHomeSection(section)
    ? section
    : "hero";

  const current = drafts[locale];

  function updateLocalePayload(next: Record<string, unknown>) {
    setDrafts((prev) => ({ ...prev, [locale]: next }));
    setJsonDraft(JSON.stringify(next, null, 2));
  }

  function switchLocale(next: AdminLocale) {
    setLocale(next);
    setJsonDraft(JSON.stringify(drafts[next], null, 2));
  }

  return (
    <AdminPageShell
      title={t.pages.home.title}
      publicPath="/"
      description={t.pages.home.description}
      sections={sections}
      activeSection={active}
      basePath="/admin/metric-home/"
      extra={
        <div
          style={{
            display: "flex",
            gap: 8,
            marginBottom: 16,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          {ADMIN_LOCALES.map((item) => (
            <button
              key={item.code}
              type="button"
              onClick={() => switchLocale(item.code)}
              style={{
                ...adminBtnPrimary,
                background: locale === item.code ? "#2600ff" : "#1a1a1a",
                borderColor: locale === item.code ? "#2600ff" : "#444",
              }}
            >
              {item.label}
            </button>
          ))}
          {saved ? (
            <span style={{ color: "#7dffa0", fontSize: 13 }}>{t.common.saved}</span>
          ) : null}
        </div>
      }
    >
      <HardNavForm action={saveMetricHomeAction}>
        <input type="hidden" name="status" value={publishStatus} />
        <input type="hidden" name="section" value={active} />
        <input
          type="hidden"
          name="en_payload"
          value={JSON.stringify(drafts.en)}
        />
        <input
          type="hidden"
          name="de_payload"
          value={JSON.stringify(drafts.de)}
        />

        <PublishBar status={publishStatus} onChange={setPublishStatus} />

        {active === "hero" ? (
          <HeroSectionEditor
            locale={locale}
            current={current}
            update={updateLocalePayload}
          />
        ) : null}
        {active === "trust" ? (
          <TrustSectionEditor
            locale={locale}
            current={current}
            update={updateLocalePayload}
          />
        ) : null}
        {active === "categories" ? (
          <CategoriesSectionEditor
            locale={locale}
            current={current}
            update={updateLocalePayload}
          />
        ) : null}
        {active === "case-studies" ? (
          <CaseStudiesSectionEditor
            locale={locale}
            current={current}
            update={updateLocalePayload}
            projects={projects}
          />
        ) : null}
        {active === "services" ? (
          <HomeServicesSectionEditor
            locale={locale}
            current={current}
            update={updateLocalePayload}
          />
        ) : null}
        {active === "workflow" ? (
          <WorkflowSectionEditor
            locale={locale}
            current={current}
            update={updateLocalePayload}
          />
        ) : null}
        {active === "faq" ? (
          <FaqChromeEditor
            locale={locale}
            current={current}
            update={updateLocalePayload}
          />
        ) : null}
        {active === "nav-footer" ? (
          <NavFooterSectionEditor
            locale={locale}
            current={current}
            update={updateLocalePayload}
          />
        ) : null}
        {active === "advanced" ? (
          <AdvancedJsonEditor
            locale={locale}
            value={jsonDraft}
            onChange={(text, parsed) => {
              setJsonDraft(text);
              if (parsed) {
                setDrafts((prev) => ({ ...prev, [locale]: parsed }));
              }
            }}
          />
        ) : null}

        <SaveButton />
      </HardNavForm>

      {active === "faq" ? (
        <div style={{ marginTop: 24 }}>
          <FaqEditor items={faq} initialEditId={faqEditId} embedded />
        </div>
      ) : null}
    </AdminPageShell>
  );
}
