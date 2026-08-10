"use client";

import { HardNavForm, hardNavAction, hardNavCreate } from "@/components/admin/HardNavForm";
import {
  ReorderStatus,
  SortableCard,
  SortableCardGrid,
  useOrderedItems,
  usePersistReorder,
} from "@/components/admin/dnd";

import { useMemo, useState, type FormEvent } from "react";
import {
  createFaqAction,
  deleteFaqAction,
  reorderFaqAction,
  saveFaqAction,
} from "@/app/admin/(dashboard)/faq/actions";
import {
  adminBtn,
  adminBtnPrimary,
  adminInput,
  adminPanel,
  clampLines,
} from "@/components/admin/ui/styles";
import {
  ADMIN_LOCALES,
  faqLocaleScore,
  isFaqLocaleFilled,
  type AdminLocale,
  type FaqDraft,
  type FaqTranslationDraft,
} from "./types";
import { formatAdminMessage, useAdminT } from "@/i18n/admin";

type Props = { items: FaqDraft[]; initialEditId?: string | null;
  embedded?: boolean };

function CardFace({
  item,
  locale,
  selected,
  onClick,
  interactive = true,
}: {
  item: FaqDraft;
  locale: AdminLocale;
  selected?: boolean;
  onClick?: () => void;
  interactive?: boolean;
}) {
  const t = useAdminT();
  const tr = item.translations[locale];
  const score = faqLocaleScore(item.translations);
  const published = item.status === "published";
  const body = (
    <article
      style={{
        display: "flex",
        height: "100%",
        minHeight: 160,
        flexDirection: "column",
        gap: 10,
        border: "1px solid #333",
        background: "#0a0a0a",
        padding: 18,
        boxSizing: "border-box",
      }}
    >
      <p style={{ ...clampLines(2), fontSize: 15, fontWeight: 600, color: "#fff", margin: 0 }}>
        {tr.question.trim() || t.pages.faq.questionPlaceholder}
      </p>
      <p style={{ ...clampLines(3), fontSize: 13, color: "#888", flex: 1, margin: 0 }}>
        {tr.answer.trim() || t.pages.faq.answerPlaceholder}
      </p>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          paddingTop: 10,
          borderTop: "1px solid #222",
          fontSize: 11,
          color: "#777",
        }}
      >
        <span style={{ color: published ? "#8c8" : "#a86", fontWeight: 600 }}>
          {published ? t.common.published : t.common.draft}
        </span>
        <span>
          {formatAdminMessage(t.common.localesFilled, {
            filled: score.filled,
            total: score.total,
          })}
        </span>
      </div>
    </article>
  );
  const wrapStyle = {
    display: "block",
    width: "100%",
    height: "100%",
    textAlign: "left" as const,
    outline: selected ? "2px solid #2600ff" : "1px solid transparent",
    outlineOffset: 3,
    boxSizing: "border-box" as const,
  };
  if (!interactive) return <div style={wrapStyle}>{body}</div>;
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        all: "unset",
        cursor: "pointer",
        ...wrapStyle,
      }}
    >
      {body}
    </button>
  );
}

export function FaqEditor({ items, initialEditId = null, embedded = false }: Props) {
  const t = useAdminT();
  const [boardLocale, setBoardLocale] = useState<AdminLocale>("ru");
  const [selectedId, setSelectedId] = useState<string | null>(initialEditId);
  const [ordered, setOrdered] = useOrderedItems(items);
  const { pending, saved, onDragEnd } = usePersistReorder(
    items,
    ordered,
    setOrdered,
    reorderFaqAction,
  );
  const selected = useMemo(
    () => ordered.find((i) => i.id === selectedId) ?? null,
    [ordered, selectedId],
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
          {!embedded ? <h1 style={{ fontSize: 32, margin: 0 }}>{t.pages.faq.title}</h1> : <h2 style={{ fontSize: 18, margin: 0 }}>{t.pages.faq.title}</h2>}
          <p style={{ color: "#888", margin: "8px 0 0" }}>{t.pages.faq.description}</p>
          <ReorderStatus pending={pending} saved={saved} />
        </div>
        <form
          action={hardNavCreate(createFaqAction, {
            successMessage: t.common.created,
            fallbackError: t.common.actionFailed,
            defaultSaved: t.common.saved,
            defaultReady: t.common.ready,
          })}
        >
          <button type="submit" style={adminBtnPrimary}>
            + {t.pages.faq.newItem}
          </button>
        </form>
      </div>

      <LocaleBoardToggle locale={boardLocale} onChange={setBoardLocale} />

      <SortableCardGrid
        items={ordered}
        onDragEnd={onDragEnd}
        renderItem={(item) => (
          <SortableCard id={item.id} onActivate={() => setSelectedId(item.id)}>
            <CardFace
              item={item}
              locale={boardLocale}
              selected={item.id === selectedId}
              interactive={false}
            />
          </SortableCard>
        )}
      />

      {selected ? (
        <>
          <Backdrop onClose={() => setSelectedId(null)} />
          <FaqPanel key={selected.id} item={selected} onClose={() => setSelectedId(null)} />
        </>
      ) : null}
    </div>
  );
}

function FaqPanel({ item, onClose }: { item: FaqDraft; onClose: () => void }) {
  const t = useAdminT();
  const [locale, setLocale] = useState<AdminLocale>("ru");
  const [draft, setDraft] = useState(item);
  const [busy, setBusy] = useState(false);
  const tr = draft.translations[locale];
  const score = faqLocaleScore(draft.translations);

  const updateLocale = (patch: Partial<FaqTranslationDraft>) => {
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
      <PanelHeader
        title={t.pages.faq.editTitle}
        score={score}
        onClose={onClose}
      />
      <HardNavForm
        action={saveFaqAction}
        onSubmit={(_e: FormEvent) => setBusy(true)}
        style={{ flex: 1, overflow: "auto", padding: 18, display: "grid", gap: 16 }}
      >
        <input type="hidden" name="id" value={draft.id} />
        {ADMIN_LOCALES.map((l) => (
          <div key={l.code}>
            <input
              type="hidden"
              name={`${l.code}_question`}
              value={draft.translations[l.code].question}
            />
            <input
              type="hidden"
              name={`${l.code}_answer`}
              value={draft.translations[l.code].answer}
            />
          </div>
        ))}
        <CardFace item={draft} locale={locale} interactive={false} />
        <LocaleTabs
          locale={locale}
          onChange={setLocale}
          isFilled={(code) => isFaqLocaleFilled(draft.translations[code])}
        />
        <label style={{ fontSize: 13 }}>
          {t.pages.faq.questionLabel} ({locale.toUpperCase()})
          <input
            value={tr.question}
            onChange={(e) => updateLocale({ question: e.target.value })}
            style={adminInput}
          />
        </label>
        <label style={{ fontSize: 13 }}>
          {t.pages.faq.answerLabel}
          <textarea
            value={tr.answer}
            onChange={(e) => updateLocale({ answer: e.target.value })}
            rows={5}
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
          deleteAction={hardNavAction(deleteFaqAction)}
          confirmDelete={t.common.confirmDelete}
        />
      </HardNavForm>
    </aside>
  );
}

function LocaleBoardToggle({
  locale,
  onChange,
}: {
  locale: AdminLocale;
  onChange: (l: AdminLocale) => void;
}) {
  const t = useAdminT();
  return (
    <div
      style={{
        display: "flex",
        gap: 8,
        marginBottom: 20,
        alignItems: "center",
        flexWrap: "wrap",
      }}
    >
      <span style={{ fontSize: 12, color: "#888" }}>{t.common.previewLanguage}</span>
      {ADMIN_LOCALES.map((item) => (
        <button
          key={item.code}
          type="button"
          onClick={() => onChange(item.code)}
          style={{
            ...adminBtn,
            background: locale === item.code ? "#fff" : "#1a1a1a",
            color: locale === item.code ? "#000" : "#fff",
          }}
        >
          {item.short}
        </button>
      ))}
    </div>
  );
}

function LocaleTabs({
  locale,
  onChange,
  isFilled,
}: {
  locale: AdminLocale;
  onChange: (l: AdminLocale) => void;
  isFilled: (l: AdminLocale) => boolean;
}) {
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      {ADMIN_LOCALES.map((l) => {
        const active = locale === l.code;
        return (
          <button
            key={l.code}
            type="button"
            onClick={() => onChange(l.code)}
            style={{
              ...adminBtn,
              background: active ? "#fff" : "#1a1a1a",
              color: active ? "#000" : "#fff",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: 0,
                background: isFilled(l.code) ? "#3d3" : "#555",
              }}
            />
            {l.short}
          </button>
        );
      })}
    </div>
  );
}

function PanelHeader({
  title,
  score,
  onClose,
}: {
  title: string;
  score: { filled: number; total: number };
  onClose: () => void;
}) {
  const t = useAdminT();
  return (
    <div
      style={{
        padding: "16px 18px",
        borderBottom: "1px solid #222",
        display: "flex",
        justifyContent: "space-between",
        gap: 12,
        alignItems: "center",
      }}
    >
      <div>
        <strong style={{ fontSize: 16 }}>{title}</strong>
        <p style={{ margin: "4px 0 0", fontSize: 12, color: "#888" }}>
          {formatAdminMessage(t.common.localesFilled, {
            filled: score.filled,
            total: score.total,
          })}
        </p>
      </div>
      <button type="button" style={adminBtn} onClick={onClose}>
        {t.common.close}
      </button>
    </div>
  );
}

function MetaFields({
  draft,
  onStatus,
  onSortOrder,
}: {
  draft: { status: string; sort_order: number };
  onStatus: (status: string) => void;
  onSortOrder: (sortOrder: number) => void;
}) {
  const t = useAdminT();
  return (
    <div className="admin-form-2col">
      <label style={{ fontSize: 13 }}>
        {t.common.status}
        <select
          name="status"
          value={draft.status}
          onChange={(e) => onStatus(e.target.value)}
          style={adminInput}
        >
          <option value="draft">{t.common.draft}</option>
          <option value="published">{t.common.published}</option>
        </select>
      </label>
      <label style={{ fontSize: 13 }}>
        {t.common.position}
        <input
          name="sort_order"
          type="number"
          value={draft.sort_order}
          onChange={(e) => onSortOrder(Number(e.target.value))}
          style={adminInput}
        />
      </label>
    </div>
  );
}

function PanelActions({
  busy,
  deleteAction,
  confirmDelete,
}: {
  busy: boolean;
  deleteAction: (formData: FormData) => void | Promise<void>;
  confirmDelete: string;
}) {
  const t = useAdminT();
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", paddingTop: 8 }}>
      <button type="submit" style={adminBtnPrimary} disabled={busy}>
        {busy ? t.common.saving : t.common.saveCard}
      </button>
      <button
        type="submit"
        formAction={deleteAction}
        style={{ ...adminBtn, color: "#f66", borderColor: "#633" }}
        onClick={(e) => {
          if (!confirm(confirmDelete)) e.preventDefault();
        }}
      >
        {t.common.delete}
      </button>
    </div>
  );
}

function Backdrop({ onClose }: { onClose: () => void }) {
  const t = useAdminT();
  return (
    <button
      type="button"
      aria-label={t.chrome.close}
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.55)",
        border: 0,
        zIndex: 35,
        cursor: "pointer",
      }}
    />
  );
}

export {
  LocaleBoardToggle,
  LocaleTabs,
  PanelHeader,
  MetaFields,
  PanelActions,
  Backdrop,
};
