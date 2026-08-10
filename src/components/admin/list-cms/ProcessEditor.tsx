"use client";

import { HardNavForm, hardNavAction, hardNavCreate } from "@/components/admin/HardNavForm";

import { useMemo, useState, type FormEvent } from "react";
import {
  createProcessStepAction,
  deleteProcessStepAction,
  saveProcessStepAction,
} from "@/app/admin/(dashboard)/process/actions";
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
  isProcessLocaleFilled,
  processLocaleScore,
  type AdminLocale,
  type ProcessDraft,
  type ProcessTranslationDraft,
} from "./types";
import { formatAdminMessage, useAdminT } from "@/i18n/admin";

type Props = { items: ProcessDraft[]; initialEditId?: string | null;
  embedded?: boolean };

function CardFace({
  item,
  locale,
  selected,
  onClick,
  interactive = true,
}: {
  item: ProcessDraft;
  locale: AdminLocale;
  selected?: boolean;
  onClick?: () => void;
  interactive?: boolean;
}) {
  const t = useAdminT();
  const tr = item.translations[locale];
  const score = processLocaleScore(item.translations);
  const published = item.status === "published";
  const body = (
    <article
      style={{
        display: "flex",
        height: "100%",
        minHeight: 170,
        flexDirection: "column",
        gap: 10,
        border: "1px solid #333",
        background: "#0a0a0a",
        padding: 18,
        boxSizing: "border-box",
      }}
    >
      <span style={{ fontSize: 12, color: "#888", fontWeight: 600 }}>
        {formatAdminMessage(t.pages.process.stepLabel, { n: item.sort_order })}
      </span>
      <p style={{ ...clampLines(2), fontSize: 16, fontWeight: 600, color: "#fff", margin: 0 }}>
        {tr.title.trim() || t.pages.process.titlePlaceholder}
      </p>
      <p style={{ ...clampLines(3), fontSize: 13, color: "#888", flex: 1, margin: 0 }}>
        {tr.description.trim() || t.pages.process.descriptionPlaceholder}
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

export function ProcessEditor({ items, initialEditId = null, embedded = false }: Props) {
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
          {!embedded ? <h1 style={{ fontSize: 32, margin: 0 }}>{t.pages.process.title}</h1> : <h2 style={{ fontSize: 18, margin: 0 }}>{t.pages.process.title}</h2>}
          <p style={{ color: "#888", margin: "8px 0 0" }}>{t.pages.process.description}</p>
        </div>
        <form
          action={hardNavCreate(createProcessStepAction, {
            successMessage: t.common.created,
            fallbackError: t.common.actionFailed,
            defaultSaved: t.common.saved,
            defaultReady: t.common.ready,
          })}
        >
          <button type="submit" style={adminBtnPrimary}>
            + {t.pages.process.newItem}
          </button>
        </form>
      </div>
      <LocaleBoardToggle locale={boardLocale} onChange={setBoardLocale} />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
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
          <ProcessPanel
            key={selected.id}
            item={selected}
            onClose={() => setSelectedId(null)}
          />
        </>
      ) : null}
    </div>
  );
}

function ProcessPanel({ item, onClose }: { item: ProcessDraft; onClose: () => void }) {
  const t = useAdminT();
  const [locale, setLocale] = useState<AdminLocale>("ru");
  const [draft, setDraft] = useState(item);
  const [busy, setBusy] = useState(false);
  const tr = draft.translations[locale];
  const score = processLocaleScore(draft.translations);

  const updateLocale = (patch: Partial<ProcessTranslationDraft>) => {
    setDraft((prev) => ({
      ...prev,
      translations: {
        ...prev.translations,
        [locale]: { ...prev.translations[locale], ...patch },
      },
    }));
  };

  return (
    <aside style={adminPanel} role="dialog">
      <PanelHeader title={t.pages.process.editTitle} score={score} onClose={onClose} />
      <HardNavForm
        action={saveProcessStepAction}
        onSubmit={(_e: FormEvent) => setBusy(true)}
        style={{ flex: 1, overflow: "auto", padding: 18, display: "grid", gap: 16 }}
      >
        <input type="hidden" name="id" value={draft.id} />
        <input type="hidden" name="step_number" value={String(draft.sort_order)} />
        {ADMIN_LOCALES.map((l) => (
          <div key={l.code}>
            <input
              type="hidden"
              name={`${l.code}_title`}
              value={draft.translations[l.code].title}
            />
            <input
              type="hidden"
              name={`${l.code}_description`}
              value={draft.translations[l.code].description}
            />
          </div>
        ))}
        <CardFace item={draft} locale={locale} interactive={false} />
        <LocaleTabs
          locale={locale}
          onChange={setLocale}
          isFilled={(code) => isProcessLocaleFilled(draft.translations[code])}
        />
        <label style={{ fontSize: 13 }}>
          {t.pages.process.titleLabel} ({locale.toUpperCase()})
          <input
            value={tr.title}
            onChange={(e) => updateLocale({ title: e.target.value })}
            style={adminInput}
          />
        </label>
        <label style={{ fontSize: 13 }}>
          {t.pages.process.descriptionLabel}
          <textarea
            value={tr.description}
            onChange={(e) => updateLocale({ description: e.target.value })}
            rows={4}
            style={{ ...adminInput, resize: "vertical" }}
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
          deleteAction={hardNavAction(deleteProcessStepAction)}
          confirmDelete={t.common.confirmDelete}
        />
      </HardNavForm>
    </aside>
  );
}
