"use client";

import { HardNavForm } from "@/components/admin/HardNavForm";

import { useMemo, useState, type CSSProperties } from "react";
import { saveAgencyAction } from "@/app/admin/(dashboard)/agency/actions";
import { formatAdminMessage, useAdminT } from "@/i18n/admin";

type LocaleCode = "ru" | "uz" | "en";

type LocaleDraft = {
  titleLine1: string;
  titleLine2: string;
  paragraphs: string;
  stats: string;
};

type Props = {
  foundedYear: string;
  translations: Record<LocaleCode, LocaleDraft>;
  saved?: boolean;
  embedded?: boolean;
};

const LOCALES: Array<{ code: LocaleCode; label: string; short: string }> = [
  { code: "ru", label: "Русский", short: "RU" },
  { code: "uz", label: "O‘zbekcha", short: "UZ" },
  { code: "en", label: "English", short: "EN" },
];

const input: CSSProperties = {
  width: "100%",
  padding: 10,
  background: "#111",
  border: "1px solid #333",
  color: "#fff",
  marginTop: 6,
  fontSize: 14,
};

const btn: CSSProperties = {
  padding: "10px 14px",
  cursor: "pointer",
  border: "1px solid #444",
  background: "#1a1a1a",
  color: "#fff",
  fontSize: 13,
};

export function AgencyEditor({ foundedYear, translations, saved, embedded }: Props) {
  const t = useAdminT();
  const [locale, setLocale] = useState<LocaleCode>("ru");
  const [year, setYear] = useState(foundedYear);
  const [draft, setDraft] = useState(translations);

  const current = draft[locale];
  const paragraphsPreview = useMemo(
    () =>
      current.paragraphs
        .split("\n")
        .map((p) => p.trim())
        .filter(Boolean),
    [current.paragraphs],
  );
  const statsRows = useMemo(
    () =>
      current.stats
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
          const [value, ...rest] = line.split("|");
          return {
            value: (value ?? "").trim(),
            label: rest.join("|").trim(),
          };
        }),
    [current.stats],
  );

  const setStatsRows = (rows: Array<{ value: string; label: string }>) => {
    update({
      stats: rows.map((row) => `${row.value}|${row.label}`).join("\n"),
    });
  };

  const update = (patch: Partial<LocaleDraft>) => {
    setDraft((prev) => ({
      ...prev,
      [locale]: { ...prev[locale], ...patch },
    }));
  };

  const copyFromRu = () => {
    if (locale === "ru") return;
    setDraft((prev) => ({
      ...prev,
      [locale]: { ...prev.ru },
    }));
  };

  const localeLabel =
    LOCALES.find((l) => l.code === locale)?.short ?? locale.toUpperCase();

  return (
    <div style={{ display: "grid", gap: 24, width: "100%" }}>
      {!embedded ? (
        <div>
          <h1 style={{ fontSize: 32, margin: 0 }}>{t.pages.agency.title}</h1>
          <p style={{ color: "#888", margin: "8px 0 0" }}>
            {t.pages.agency.editHint}{" "}
            <a href="/agency/" style={{ color: "#8cf" }} target="_blank" rel="noreferrer">
              /agency/
            </a>
          </p>
          {saved ? (
            <p style={{ color: "#6f6", margin: "10px 0 0" }}>{t.pages.agency.savedHint}</p>
          ) : null}
        </div>
      ) : saved ? (
        <p style={{ color: "#6f6", margin: 0 }}>{t.pages.agency.savedHint}</p>
      ) : null}

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <span style={{ fontSize: 12, color: "#888" }}>{t.pages.agency.languageLabel}:</span>
        {LOCALES.map((item) => (
          <button
            key={item.code}
            type="button"
            onClick={() => setLocale(item.code)}
            style={{
              ...btn,
              background: locale === item.code ? "#fff" : "#1a1a1a",
              color: locale === item.code ? "#000" : "#fff",
            }}
          >
            {item.short}
          </button>
        ))}
        {locale !== "ru" ? (
          <button type="button" style={btn} onClick={copyFromRu}>
            {t.common.copyFromRu}
          </button>
        ) : null}
      </div>

      <HardNavForm action={saveAgencyAction} style={{ display: "grid", gap: 20 }}>
        {LOCALES.map((item) => (
          <div key={`hidden-${item.code}`}>
            <input
              type="hidden"
              name={`${item.code}_title_line_1`}
              value={draft[item.code].titleLine1}
              readOnly
            />
            <input
              type="hidden"
              name={`${item.code}_title_line_2`}
              value={draft[item.code].titleLine2}
              readOnly
            />
            <input
              type="hidden"
              name={`${item.code}_paragraphs`}
              value={draft[item.code].paragraphs}
              readOnly
            />
            <input
              type="hidden"
              name={`${item.code}_stats`}
              value={draft[item.code].stats}
              readOnly
            />
          </div>
        ))}

        <label style={{ maxWidth: 200, fontSize: 13 }}>
          {t.pages.agency.foundedYear}
          <input
            name="founded_year"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            style={input}
          />
        </label>

        <section
          className="admin-surface-preview"
          style={{
            border: "1px solid #333",
            background: "#050505",
            padding: 16,
            display: "grid",
            gap: 20,
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: 11,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#777",
            }}
          >
            {formatAdminMessage(t.pages.agency.previewLabel, {
              locale: locale.toUpperCase(),
            })}
          </p>

          <div className="admin-preview-hero">
            <h2
              className="admin-surface-preview__title"
              style={{
                margin: 0,
                fontWeight: 500,
                lineHeight: 1.1,
                letterSpacing: "-0.02em",
              }}
            >
              {current.titleLine1 || t.pages.agency.titleLine1Placeholder}
              <br />
              {current.titleLine2 || t.pages.agency.titleLine2Placeholder}
            </h2>
            <div
              style={{
                display: "grid",
                gap: 12,
                fontSize: 15,
                lineHeight: 1.3,
                minWidth: 0,
              }}
            >
              {paragraphsPreview.length ? (
                paragraphsPreview.map((p) => (
                  <p key={p} style={{ margin: 0, overflowWrap: "anywhere" }}>
                    {p}
                  </p>
                ))
              ) : (
                <p style={{ margin: 0, color: "#666" }}>{t.pages.agency.paragraphsEmpty}</p>
              )}
            </div>
          </div>

          <div
            style={{
              position: "relative",
              aspectRatio: "1432 / 420",
              background: "#2600ff",
              display: "grid",
              placeItems: "end start",
              padding: "16px 14px",
              minWidth: 0,
            }}
          >
            <span
              style={{
                fontSize: "clamp(16px, 4.5vw, 22px)",
                fontWeight: 500,
                overflowWrap: "anywhere",
              }}
            >
              {formatAdminMessage(t.pages.agency.foundedIn, { year: year || "2019" })}
            </span>
          </div>

          <div className="admin-preview-stats">
            {(statsRows.length
              ? statsRows
              : [
                  { value: "—", label: t.pages.agency.statEmpty },
                  { value: "—", label: t.pages.agency.statEmpty },
                  { value: "—", label: t.pages.agency.statEmpty },
                  { value: "—", label: t.pages.agency.statEmpty },
                ]
            ).map((stat, i) => (
              <div
                key={`${stat.value}-${stat.label}-${i}`}
                style={{ display: "grid", gap: 8, minWidth: 0 }}
              >
                <span
                  className="admin-surface-preview__stat"
                  style={{ fontWeight: 500, lineHeight: 1, overflowWrap: "anywhere" }}
                >
                  {stat.value}
                </span>
                <span style={{ fontSize: 13, color: "#ccc", overflowWrap: "anywhere" }}>
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section
          style={{
            border: "1px solid #333",
            padding: 16,
            display: "grid",
            gap: 14,
          }}
        >
          <strong>
            {formatAdminMessage(t.pages.agency.contentSection, { label: localeLabel })}
          </strong>

          <label style={{ fontSize: 13 }}>
            {t.pages.agency.titleLine1Label}
            <input
              value={current.titleLine1}
              onChange={(e) => update({ titleLine1: e.target.value })}
              placeholder={t.pages.agency.titleLine1Placeholder}
              style={input}
            />
          </label>
          <label style={{ fontSize: 13 }}>
            {t.pages.agency.titleLine2Label}
            <input
              value={current.titleLine2}
              onChange={(e) => update({ titleLine2: e.target.value })}
              placeholder={t.pages.agency.titleLine2Placeholder}
              style={input}
            />
          </label>
          <label style={{ fontSize: 13 }}>
            {t.pages.agency.paragraphsLabel}
            <textarea
              value={current.paragraphs}
              onChange={(e) => update({ paragraphs: e.target.value })}
              rows={5}
              style={input}
            />
          </label>
          <div style={{ display: "grid", gap: 10 }}>
            <strong style={{ fontSize: 13 }}>{t.pages.agency.stats}</strong>
            <p style={{ margin: 0, fontSize: 12, color: "#888" }}>{t.pages.agency.statsHint}</p>
            {(statsRows.length ? statsRows : [{ value: "", label: "" }]).map(
              (row, index) => (
                <div key={`stat-${index}`} className="admin-preview-stat-row">
                  <label style={{ fontSize: 12 }}>
                    {t.pages.agency.statValue}
                    <input
                      value={row.value}
                      onChange={(e) => {
                        const next = (statsRows.length
                          ? [...statsRows]
                          : [{ value: "", label: "" }]
                        ).map((item, i) =>
                          i === index ? { ...item, value: e.target.value } : item,
                        );
                        setStatsRows(next);
                      }}
                      placeholder={t.pages.agency.statValuePlaceholder}
                      style={input}
                    />
                  </label>
                  <label style={{ fontSize: 12 }}>
                    {t.pages.agency.statLabel}
                    <input
                      value={row.label}
                      onChange={(e) => {
                        const next = (statsRows.length
                          ? [...statsRows]
                          : [{ value: "", label: "" }]
                        ).map((item, i) =>
                          i === index ? { ...item, label: e.target.value } : item,
                        );
                        setStatsRows(next);
                      }}
                      placeholder={t.pages.agency.statLabelPlaceholder}
                      style={input}
                    />
                  </label>
                  <button
                    type="button"
                    style={{ ...btn, marginBottom: 0 }}
                    onClick={() => {
                      const base = statsRows.length
                        ? [...statsRows]
                        : [{ value: "", label: "" }];
                      setStatsRows(base.filter((_, i) => i !== index));
                    }}
                  >
                    ✕
                  </button>
                </div>
              ),
            )}
            <button
              type="button"
              style={{ ...btn, maxWidth: 180 }}
              onClick={() =>
                setStatsRows([
                  ...(statsRows.length ? statsRows : []),
                  { value: "", label: "" },
                ])
              }
            >
              {t.pages.agency.addStat}
            </button>
          </div>
        </section>

        <button
          type="submit"
          style={{
            ...btn,
            background: "#2600ff",
            borderColor: "#2600ff",
            fontWeight: 600,
            maxWidth: 220,
          }}
        >
          {t.pages.agency.save}
        </button>
      </HardNavForm>
    </div>
  );
}
