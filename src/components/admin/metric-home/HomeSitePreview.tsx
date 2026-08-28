"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AdminSiteScaleFrame } from "@/components/admin/preview/AdminSiteScaleFrame";
import type { MetricHomeSectionId } from "@/components/admin/metric-home/helpers";
import type { FaqDraft } from "@/components/admin/list-cms/types";
import type { AdminLocale } from "@/components/admin/ui/locales";
import { adminBtn } from "@/components/admin/ui/styles";
import {
  MetricCaseStudiesSection,
  MetricCategoriesSection,
  MetricHeroSection,
  MetricServicesSection,
  MetricWorkflowSection,
} from "@/components/organisms/MetricHomeSections";
import { MetricFaqSection } from "@/components/organisms/MetricFaqSection";
import { getMetricHome, type MetricHomeContent } from "@/data/metric-home";
import type { FAQItem } from "@/data/faq";
import { useAdminT } from "@/i18n/admin";
import { mergeMetricHome } from "@/lib/cms/metric-home-merge";

type Props = {
  payload: Record<string, unknown>;
  locale: AdminLocale;
  section: MetricHomeSectionId;
  dirty: boolean;
  faq: FaqDraft[];
};

type Device = "desktop" | "mobile";
type Scope = "section" | "page";

/** Sections that map 1:1 onto a public homepage block. */
const SECTION_ORDER: MetricHomeSectionId[] = [
  "hero",
  "categories",
  "case-studies",
  "services",
  "workflow",
  "faq",
];

function previewSectionFor(section: MetricHomeSectionId): MetricHomeSectionId {
  // Trust cards live inside the hero; JSON editing has no single block.
  if (section === "trust") return "hero";
  if (section === "advanced") return "hero";
  return section;
}

function faqItemsFor(faq: FaqDraft[], locale: AdminLocale): FAQItem[] {
  return faq
    .filter((item) => item.status === "published")
    .map((item) => {
      const tr = item.translations[locale] ?? item.translations.en;
      return { question: tr?.question ?? "", answer: tr?.answer ?? "" };
    })
    .filter((item) => item.question.trim() || item.answer.trim());
}

function NavFooterPreview({ home }: { home: MetricHomeContent }) {
  const t = useAdminT();

  return (
    <div style={{ background: "#fff", padding: "28px 32px", display: "grid", gap: 28 }}>
      <div style={{ display: "grid", gap: 10 }}>
        <p style={{ margin: 0, fontSize: 12, color: "#888" }}>
          {t.pages.home.previewNavLabel}
        </p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {home.nav.map((item) => (
            <span
              key={item.href}
              className="metric-pill"
              style={{ fontSize: 16, padding: "10px 16px" }}
            >
              {item.label}
            </span>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gap: 10 }}>
        <p style={{ margin: 0, fontSize: 12, color: "#888" }}>
          {t.pages.home.previewFooterLabel}
        </p>
        <div style={{ display: "grid", gap: 12, color: "#090909" }}>
          <strong className="font-display" style={{ fontSize: 28 }}>
            {home.footer.startCta}
          </strong>
          <p style={{ margin: 0, fontSize: 16, color: "rgba(9,9,9,0.62)" }}>
            {home.footer.cities.join(" · ")}
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", fontSize: 15 }}>
            {home.footer.social.map((item) => (
              <span key={item.key}>{item.label}</span>
            ))}
          </div>
          <div
            style={{
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
              fontSize: 14,
              color: "rgba(9,9,9,0.5)",
            }}
          >
            {home.footer.links.map((link) => (
              <span key={link.href}>{link.label}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function HomeSitePreview({ payload, locale, section, dirty, faq }: Props) {
  const t = useAdminT();
  const [device, setDevice] = useState<Device>("desktop");
  const [scope, setScope] = useState<Scope>("section");

  const home = useMemo(
    () =>
      mergeMetricHome(
        getMetricHome(locale),
        payload as Partial<MetricHomeContent>,
      ),
    [payload, locale],
  );
  const faqItems = useMemo(() => faqItemsFor(faq, locale), [faq, locale]);

  const designWidth = device === "desktop" ? 1440 : 390;
  const viewportWidth = device === "desktop" ? 380 : 280;
  const publicPath = locale === "en" ? "/" : `/${locale}/`;
  const target = previewSectionFor(section);

  function renderSection(id: MetricHomeSectionId) {
    switch (id) {
      case "hero":
        return <MetricHeroSection locale={locale} home={home} />;
      case "categories":
        return <MetricCategoriesSection locale={locale} home={home} />;
      case "case-studies":
        return <MetricCaseStudiesSection locale={locale} home={home} />;
      case "services":
        return <MetricServicesSection locale={locale} home={home} />;
      case "workflow":
        return <MetricWorkflowSection locale={locale} home={home} />;
      case "faq":
        return (
          <MetricFaqSection locale={locale} items={faqItems} faq={home.faq} />
        );
      default:
        return null;
    }
  }

  const body =
    section === "nav-footer" ? (
      <NavFooterPreview home={home} />
    ) : scope === "page" || section === "advanced" ? (
      <>
        {SECTION_ORDER.map((id) => (
          <div key={id}>{renderSection(id)}</div>
        ))}
        <NavFooterPreview home={home} />
      </>
    ) : (
      renderSection(target)
    );

  return (
    <aside
      style={{
        position: "sticky",
        top: 72,
        alignSelf: "start",
        display: "grid",
        gap: 12,
        width: "100%",
        maxWidth: 420,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 8,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <strong style={{ fontSize: 13 }}>{t.pages.home.sitePreview}</strong>
        <div style={{ display: "flex", gap: 6 }}>
          {(["desktop", "mobile"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setDevice(mode)}
              style={{
                ...adminBtn,
                padding: "6px 10px",
                fontSize: 12,
                background: device === mode ? "#fff" : "#1a1a1a",
                color: device === mode ? "#000" : "#fff",
              }}
            >
              {mode === "desktop" ? "Desktop" : "Mobile"}
            </button>
          ))}
        </div>
      </div>

      {section !== "nav-footer" && section !== "advanced" ? (
        <div style={{ display: "flex", gap: 6 }}>
          {(
            [
              ["section", t.pages.home.previewSectionOnly],
              ["page", t.pages.home.previewFullPage],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setScope(id)}
              style={{
                ...adminBtn,
                padding: "6px 10px",
                fontSize: 12,
                background: scope === id ? "#fff" : "#1a1a1a",
                color: scope === id ? "#000" : "#fff",
              }}
            >
              {label}
            </button>
          ))}
        </div>
      ) : null}

      {dirty ? (
        <p
          style={{
            margin: 0,
            padding: "8px 10px",
            borderRadius: 8,
            background: "#3a2a00",
            border: "1px solid #a67c00",
            color: "#f5d78e",
            fontSize: 12,
            lineHeight: 1.35,
          }}
        >
          {t.pages.home.previewUnsaved}
        </p>
      ) : null}

      <div style={{ maxHeight: 640, overflow: "auto" }}>
        <AdminSiteScaleFrame
          designWidth={designWidth}
          viewportWidth={viewportWidth}
          className={[
            "admin-site-preview--home",
            device === "desktop"
              ? "admin-site-preview--home-desktop"
              : "admin-site-preview--home-mobile",
          ].join(" ")}
        >
          {body}
        </AdminSiteScaleFrame>
      </div>

      <div style={{ display: "grid", gap: 6 }}>
        <Link
          href={publicPath}
          target="_blank"
          rel="noreferrer"
          style={{ ...adminBtn, textDecoration: "none", justifySelf: "start" }}
        >
          {t.pages.project.openOnSite} →
        </Link>
        <span style={{ fontSize: 11, color: "#777", lineHeight: 1.35 }}>
          {t.pages.home.previewHint}
        </span>
      </div>
    </aside>
  );
}
