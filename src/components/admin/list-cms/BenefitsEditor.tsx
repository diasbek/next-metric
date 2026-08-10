"use client";

import { HardNavForm, hardNavAction, hardNavCreate } from "@/components/admin/HardNavForm";

import { useMemo, useState, type FormEvent } from "react";
import {
  createBenefitAction,
  deleteBenefitAction,
  saveBenefitAction,
} from "@/app/admin/(dashboard)/benefits/actions";
import {
  adminBtn,
  adminBtnPrimary,
  adminInput,
  adminPanel,
  clampLines,
} from "@/components/admin/ui/styles";
import {
  Backdrop,
  LocaleBoardToggle,
  LocaleTabs,
  MetaFields,
  PanelActions,
  PanelHeader,
} from "./FaqEditor";
import {
  ADMIN_LOCALES,
  benefitLocaleScore,
  isBenefitLocaleFilled,
  type AdminLocale,
  type BenefitDraft,
} from "./types";
import { formatAdminMessage, useAdminT } from "@/i18n/admin";

type Props = { items: BenefitDraft[]; initialEditId?: string | null;
  embedded?: boolean };

function CardFace({
  item,
  locale,
  selected,
  onClick,
  interactive = true,
}: {
  item: BenefitDraft;
  locale: AdminLocale;
  selected?: boolean;
  onClick?: () => void;
  interactive?: boolean;
}) {
  const t = useAdminT();
  const tr = item.translations[locale];
  const score = benefitLocaleScore(item.translations);
  const published = item.status === "published";
  const body = (
    <article
      style={{
        display: "flex",
        height: "100%",
        minHeight: 120,
        flexDirection: "column",
        justifyContent: "space-between",
        gap: 12,
        border: "1px solid #333",
        background: "#0a0a0a",
        padding: 18,
        boxSizing: "border-box",
      }}
    >
      <p style={{ ...clampLines(3), fontSize: 16, fontWeight: 500, color: "#fff", margin: 0 }}>
        {tr.label.trim() || t.pages.benefits.labelPlaceholder}
      </p>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          paddingTop: 10,
          borderTop: "1px solid #222",
          fontSize: 11,
        }}
      >
        <span style={{ color: published ? "#8c8" : "#a86", fontWeight: 600 }}>
          {published ? t.common.published : t.common.draft}
        </span>
        <span style={{ color: "#777" }}>
          {formatAdminMessage(t.common.localesFilled, {
            filled: score.filled,
            total: score.total,
          })}
        </span>
      </div>
    </article>
  );
  if (!interactive) return body;
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        all: "unset",
        cursor: "pointer",
        display: "block",
        width: "100%",
        height: "100%",
        textAlign: "left",
        outline: selected ? "2px solid #2600ff" : "1px solid transparent",
        outlineOffset: 3,
      }}
    >
      {body}
    </button>
  );
}

export function BenefitsEditor({ items, initialEditId = null, embedded = false }: Props) {
  const t = useAdminT();
  const [boardLocale, setBoardLocale] = useState<AdminLocale>("ru");
  const [selectedId, setSelectedId] = useState<string | null>(initialEditId);
  const selected = useMemo(
    () => items.find((i) => i.id === selectedId) ?? null,
    [items, selectedId],
  );

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 16,
          marginBottom: 20,
          flexWrap: "wrap",
        }}
      >
        <div>
          {!embedded ? (
            <h1 style={{ fontSize: 32, margin: 0 }}>{t.pages.benefits.title}</h1>
          ) : (
            <h2 style={{ fontSize: 18, margin: 0 }}>{t.pages.benefits.listTitle}</h2>
          )}
          <p style={{ color: "#888", margin: "8px 0 0" }}>
            {embedded
              ? t.pages.benefits.listDescription
              : t.pages.benefits.description}
          </p>
        </div>
        <form
          action={hardNavCreate(createBenefitAction, {
            successMessage: t.common.created,
            fallbackError: t.common.actionFailed,
            defaultSaved: t.common.saved,
            defaultReady: t.common.ready,
          })}
        >
          <button type="submit" style={adminBtnPrimary}>
            + {t.pages.benefits.newItem}
          </button>
        </form>
      </div>
      <LocaleBoardToggle locale={boardLocale} onChange={setBoardLocale} />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: 16,
        }}
      >
        {items.map((item) => (
          <CardFace
            key={item.id}
            item={item}
            locale={boardLocale}
            selected={item.id === selectedId}
            onClick={() => setSelectedId(item.id)}
          />
        ))}
      </div>
      {selected ? (
        <>
          <Backdrop onClose={() => setSelectedId(null)} />
          <BenefitPanel
            key={selected.id}
            item={selected}
            onClose={() => setSelectedId(null)}
          />
        </>
      ) : null}
    </div>
  );
}

function BenefitPanel({ item, onClose }: { item: BenefitDraft; onClose: () => void }) {
  const t = useAdminT();
  const [locale, setLocale] = useState<AdminLocale>("ru");
  const [draft, setDraft] = useState(item);
  const [busy, setBusy] = useState(false);
  const tr = draft.translations[locale];
  const score = benefitLocaleScore(draft.translations);

  return (
    <aside style={adminPanel} role="dialog">
      <PanelHeader title={t.pages.benefits.editTitle} score={score} onClose={onClose} />
      <HardNavForm
        action={saveBenefitAction}
        onSubmit={(_e: FormEvent) => setBusy(true)}
        style={{ flex: 1, overflow: "auto", padding: 18, display: "grid", gap: 16 }}
      >
        <input type="hidden" name="id" value={draft.id} />
        {ADMIN_LOCALES.map((l) => (
          <input
            key={l.code}
            type="hidden"
            name={`${l.code}_label`}
            value={draft.translations[l.code].label}
          />
        ))}
        <CardFace item={draft} locale={locale} interactive={false} />
        <LocaleTabs
          locale={locale}
          onChange={setLocale}
          isFilled={(code) => isBenefitLocaleFilled(draft.translations[code])}
        />
        <label style={{ fontSize: 13 }}>
          {t.pages.benefits.textLabel} ({locale.toUpperCase()})
          <input
            value={tr.label}
            onChange={(e) =>
              setDraft((prev) => ({
                ...prev,
                translations: {
                  ...prev.translations,
                  [locale]: { ...prev.translations[locale], label: e.target.value },
                },
              }))
            }
            style={adminInput}
          />
        </label>
        {locale !== "ru" ? (
          <button
            type="button"
            style={adminBtn}
            onClick={() =>
              setDraft((prev) => ({
                ...prev,
                translations: {
                  ...prev.translations,
                  [locale]: { ...prev.translations.ru, locale },
                },
              }))
            }
          >
            {t.common.copyFromRu}
          </button>
        ) : null}
        <MetaFields
          draft={draft}
          onStatus={(status) => setDraft((p) => ({ ...p, status }))}
          onSortOrder={(sort_order) => setDraft((p) => ({ ...p, sort_order }))}
        />
        <PanelActions
          busy={busy}
          deleteAction={hardNavAction(deleteBenefitAction)}
          confirmDelete={t.common.confirmDelete}
        />
      </HardNavForm>
    </aside>
  );
}
