"use client";

import { useState } from "react";
import { HardNavForm } from "@/components/admin/HardNavForm";
import { BenefitsEditor } from "@/components/admin/list-cms/BenefitsEditor";
import type { AdminLocale, BenefitDraft } from "@/components/admin/list-cms/types";
import { ADMIN_LOCALES } from "@/components/admin/list-cms/types";
import { saveHomeWhyUsAction } from "@/app/admin/(dashboard)/home/actions";
import {
  adminBtn,
  adminBtnPrimary,
  adminInput,
} from "@/components/admin/ui/styles";
import { useAdminT } from "@/i18n/admin";

export type WhyUsTitleDraft = Record<
  AdminLocale,
  { titleLine1: string; titleLine2: string }
>;

type Props = {
  titles: WhyUsTitleDraft;
  benefits: BenefitDraft[];
  initialEditId?: string | null;
  saved?: boolean;
};

export function HomeWhyUsEditor({
  titles: initialTitles,
  benefits,
  initialEditId = null,
  saved = false,
}: Props) {
  const t = useAdminT();
  const [locale, setLocale] = useState<AdminLocale>("en");
  const [draft, setDraft] = useState(initialTitles);
  const current = draft[locale];

  const copyFromEn = () => {
    setDraft((prev) => ({
      ...prev,
      [locale]: { ...prev.en },
    }));
  };

  return (
    <div style={{ display: "grid", gap: 28 }}>
      <section
        style={{
          border: "1px solid #333",
          background: "#0c0c0c",
          padding: 18,
          display: "grid",
          gap: 16,
        }}
      >
        <div>
          <h2 style={{ fontSize: 18, margin: 0 }}>{t.pages.benefits.sectionTitle}</h2>
          <p style={{ color: "#888", margin: "8px 0 0", fontSize: 13 }}>
            {t.pages.benefits.sectionTitleHint}
          </p>
          {saved ? (
            <p style={{ color: "#6f6", margin: "10px 0 0" }}>{t.common.saved}.</p>
          ) : null}
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ fontSize: 12, color: "#888" }}>
            {t.pages.agency.languageLabel}:
          </span>
          {ADMIN_LOCALES.map((item) => (
            <button
              key={item.code}
              type="button"
              onClick={() => setLocale(item.code)}
              style={{
                ...adminBtn,
                background: locale === item.code ? "#fff" : "#1a1a1a",
                color: locale === item.code ? "#000" : "#fff",
                minHeight: 36,
                padding: "8px 12px",
              }}
            >
              {item.short}
            </button>
          ))}
          {locale !== "en" ? (
            <button type="button" style={adminBtn} onClick={copyFromEn}>
              {t.common.copyFromEn}
            </button>
          ) : null}
        </div>

        <HardNavForm
          action={saveHomeWhyUsAction}
          style={{ display: "grid", gap: 14, maxWidth: 560 }}
        >
          {ADMIN_LOCALES.map((item) => (
            <div key={`hidden-${item.code}`}>
              <input
                type="hidden"
                name={`${item.code}_why_us_title_line_1`}
                value={draft[item.code].titleLine1}
                readOnly
              />
              <input
                type="hidden"
                name={`${item.code}_why_us_title_line_2`}
                value={draft[item.code].titleLine2}
                readOnly
              />
            </div>
          ))}

          <label style={{ fontSize: 13 }}>
            {t.pages.benefits.titleLine1Label}
            <input
              value={current.titleLine1}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  [locale]: { ...prev[locale], titleLine1: e.target.value },
                }))
              }
              placeholder={t.pages.benefits.titleLine1Placeholder}
              style={adminInput}
            />
          </label>

          <label style={{ fontSize: 13 }}>
            {t.pages.benefits.titleLine2Label}
            <input
              value={current.titleLine2}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  [locale]: { ...prev[locale], titleLine2: e.target.value },
                }))
              }
              placeholder={t.pages.benefits.titleLine2Placeholder}
              style={adminInput}
            />
          </label>

          <div
            style={{
              border: "1px solid #222",
              background: "#0a0a0a",
              padding: 16,
            }}
          >
            <p style={{ margin: "0 0 8px", fontSize: 11, color: "#666" }}>
              {t.pages.benefits.previewLabel}
            </p>
            <p
              style={{
                margin: 0,
                fontSize: 28,
                fontWeight: 500,
                lineHeight: 1.15,
                color: "#fff",
              }}
            >
              {current.titleLine1 || t.pages.benefits.titleLine1Placeholder}
              <br />
              {current.titleLine2 || t.pages.benefits.titleLine2Placeholder}
            </p>
          </div>

          <button type="submit" style={{ ...adminBtnPrimary, maxWidth: 220 }}>
            {t.pages.benefits.saveTitle}
          </button>
        </HardNavForm>
      </section>

      <BenefitsEditor
        items={benefits}
        initialEditId={initialEditId}
        embedded
      />
    </div>
  );
}
