"use client";

import { HardNavForm, hardNavAction, hardNavCreate } from "@/components/admin/HardNavForm";
import {
  ReorderStatus,
  SortableCard,
  SortableCardGrid,
  useOrderedItems,
  usePersistReorder,
} from "@/components/admin/dnd";

import { useMemo, useState, type CSSProperties, type FormEvent } from "react";
import {
  createServiceAction,
  deleteServiceAction,
  reorderServicesAction,
  saveServiceAction,
} from "@/app/admin/(dashboard)/services/actions";
import {
  adminBtn,
  adminBtnPrimary,
  adminInput,
  adminPanel,
  clampLines,
} from "@/components/admin/ui/styles";
import {
  ADMIN_LOCALES,
  isServiceLocaleFilled,
  serviceLocaleScore,
  type AdminLocale,
  type ServiceDraft,
  type ServiceTranslationDraft,
} from "./types";
import { formatAdminMessage, useAdminT } from "@/i18n/admin";

type Props = {
  items: ServiceDraft[];
  initialEditId?: string | null;
  embedded?: boolean;
};

const cardShell: CSSProperties = {
  display: "flex",
  height: "100%",
  minHeight: 200,
  flexDirection: "column",
  gap: 12,
  border: "1px solid #333",
  background: "#0a0a0a",
  padding: 18,
  color: "#fff",
  boxSizing: "border-box",
};

function CardFace({
  item,
  locale,
  selected,
  onClick,
  interactive = true,
}: {
  item: ServiceDraft;
  locale: AdminLocale;
  selected?: boolean;
  onClick?: () => void;
  interactive?: boolean;
}) {
  const t = useAdminT();
  const tr = item.translations[locale];
  const score = serviceLocaleScore(item.translations);
  const published = item.status === "published";

  const body = (
    <article style={cardShell}>
      <p style={{ ...clampLines(2), fontSize: 18, fontWeight: 600, letterSpacing: "-0.02em" }}>
        {tr.title.trim() || t.pages.services.titlePlaceholder}
      </p>
      <p style={{ ...clampLines(3), fontSize: 13, color: "#999", flex: 1 }}>
        {tr.short.trim() || t.pages.services.shortPlaceholder}
      </p>
      <div style={{ display: "flex", gap: 12, fontSize: 12, color: "#777" }}>
        <span>{tr.price.trim() || "—"}</span>
        <span>{tr.duration.trim() || "—"}</span>
      </div>
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
    boxSizing: "border-box" as const,
    outline: selected ? "2px solid #2600ff" : "1px solid transparent",
    outlineOffset: 3,
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

export function ServicesEditor({ items, initialEditId = null, embedded = false }: Props) {
  const t = useAdminT();
  const [boardLocale, setBoardLocale] = useState<AdminLocale>("en");
  const [selectedId, setSelectedId] = useState<string | null>(initialEditId);
  const [ordered, setOrdered] = useOrderedItems(items);
  const { pending, saved, onDragEnd } = usePersistReorder(
    items,
    ordered,
    setOrdered,
    reorderServicesAction,
  );
  const selected = useMemo(
    () => ordered.find((item) => item.id === selectedId) ?? null,
    [ordered, selectedId],
  );

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 16,
          marginBottom: 20,
          flexWrap: "wrap",
        }}
      >
        <div>
          {!embedded ? <h1 style={{ fontSize: 32, margin: 0 }}>{t.pages.services.title}</h1> : <h2 style={{ fontSize: 18, margin: 0 }}>{t.pages.services.title}</h2>}
          <p style={{ color: "#888", margin: "8px 0 0" }}>{t.pages.services.description}</p>
          <ReorderStatus pending={pending} saved={saved} />
        </div>
        <form
          action={hardNavCreate(createServiceAction, {
            successMessage: t.common.created,
            fallbackError: t.common.actionFailed,
            defaultSaved: t.common.saved,
            defaultReady: t.common.ready,
          })}
        >
          <button type="submit" style={adminBtnPrimary}>
            + {t.pages.services.newItem}
          </button>
        </form>
      </div>

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
        {ADMIN_LOCALES.map((locale) => (
          <button
            key={locale.code}
            type="button"
            onClick={() => setBoardLocale(locale.code)}
            style={{
              ...adminBtn,
              background: boardLocale === locale.code ? "#fff" : "#1a1a1a",
              color: boardLocale === locale.code ? "#000" : "#fff",
            }}
          >
            {locale.short}
          </button>
        ))}
      </div>

      <SortableCardGrid
        items={ordered}
        onDragEnd={onDragEnd}
        style={{
          gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
        }}
        renderItem={(item) => (
          <SortableCard
            id={item.id}
            onActivate={() => setSelectedId(item.id)}
            style={{ minHeight: 200 }}
          >
            <CardFace
              item={item}
              locale={boardLocale}
              selected={item.id === selectedId}
              interactive={false}
            />
          </SortableCard>
        )}
      />

      {ordered.length === 0 ? (
        <p style={{ color: "#888", marginTop: 24 }}>{t.pages.services.empty}</p>
      ) : null}

      {selected ? (
        <>
          <button
            type="button"
            aria-label={t.chrome.close}
            onClick={() => setSelectedId(null)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.55)",
              border: 0,
              zIndex: 35,
              cursor: "pointer",
            }}
          />
          <ServiceEditPanel
            key={selected.id}
            item={selected}
            onClose={() => setSelectedId(null)}
          />
        </>
      ) : null}
    </div>
  );
}

function ServiceEditPanel({
  item,
  onClose,
}: {
  item: ServiceDraft;
  onClose: () => void;
}) {
  const t = useAdminT();
  const [locale, setLocale] = useState<AdminLocale>("en");
  const [draft, setDraft] = useState(item);
  const [busy, setBusy] = useState(false);
  const tr = draft.translations[locale];
  const score = serviceLocaleScore(draft.translations);

  const updateLocale = (patch: Partial<ServiceTranslationDraft>) => {
    setDraft((prev) => ({
      ...prev,
      translations: {
        ...prev.translations,
        [locale]: { ...prev.translations[locale], ...patch },
      },
    }));
  };

  const copyFromEn = () => {
    if (locale === "en") return;
    const ru = draft.translations.en;
    setDraft((prev) => ({
      ...prev,
      translations: {
        ...prev.translations,
        [locale]: { ...ru, locale },
      },
    }));
  };

  const onSubmit = (_event: FormEvent<HTMLFormElement>) => {
    setBusy(true);
  };

  return (
    <aside style={adminPanel} role="dialog" aria-label={t.pages.services.editTitle}>
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
          <strong style={{ fontSize: 16 }}>{t.pages.services.editTitle}</strong>
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

      <HardNavForm
        action={saveServiceAction}
        onSubmit={onSubmit}
        style={{
          flex: 1,
          overflow: "auto",
          padding: 18,
          display: "grid",
          gap: 16,
          alignContent: "start",
        }}
      >
        <input type="hidden" name="id" value={draft.id} />
        {ADMIN_LOCALES.map((l) => (
          <div key={l.code}>
            <input type="hidden" name={`${l.code}_title`} value={draft.translations[l.code].title} />
            <input type="hidden" name={`${l.code}_short`} value={draft.translations[l.code].short} />
            <input type="hidden" name={`${l.code}_full`} value={draft.translations[l.code].full} />
            <input type="hidden" name={`${l.code}_price`} value={draft.translations[l.code].price} />
            <input
              type="hidden"
              name={`${l.code}_duration`}
              value={draft.translations[l.code].duration}
            />
          </div>
        ))}

        <div style={{ pointerEvents: "none" }}>
          <CardFace item={draft} locale={locale} interactive={false} />
        </div>

        <div>
          <p style={{ margin: "0 0 8px", fontSize: 12, color: "#888" }}>{t.common.contentLanguage}</p>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {ADMIN_LOCALES.map((l) => {
              const filled = isServiceLocaleFilled(draft.translations[l.code]);
              const active = locale === l.code;
              return (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => setLocale(l.code)}
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
                      background: filled ? "#3d3" : "#555",
                    }}
                  />
                  {l.short}
                </button>
              );
            })}
          </div>
        </div>

        <label style={{ display: "grid", gap: 4, fontSize: 13 }}>
          {t.common.name} ({locale.toUpperCase()})
          <input
            value={tr.title}
            onChange={(e) => updateLocale({ title: e.target.value })}
            style={adminInput}
          />
        </label>
        <label style={{ display: "grid", gap: 4, fontSize: 13 }}>
          {t.pages.services.shortPlaceholder}
          <input
            value={tr.short}
            onChange={(e) => updateLocale({ short: e.target.value })}
            style={adminInput}
          />
        </label>
        <label style={{ display: "grid", gap: 4, fontSize: 13 }}>
          {t.pages.project.descriptionLabel}
          <textarea
            value={tr.full}
            onChange={(e) => updateLocale({ full: e.target.value })}
            rows={4}
            style={{ ...adminInput, resize: "vertical" }}
          />
        </label>
        <div className="admin-form-2col">
          <label style={{ fontSize: 13 }}>
            {t.common.price}
            <input
              value={tr.price}
              onChange={(e) => updateLocale({ price: e.target.value })}
              style={adminInput}
            />
          </label>
          <label style={{ fontSize: 13 }}>
            {t.common.duration}
            <input
              value={tr.duration}
              onChange={(e) => updateLocale({ duration: e.target.value })}
              style={adminInput}
            />
          </label>
        </div>

        {locale !== "en" ? (
          <button type="button" style={adminBtn} onClick={copyFromEn}>
            {t.common.copyFromEn}
          </button>
        ) : null}

        <div className="admin-form-2col">
          <label style={{ fontSize: 13 }}>
            {t.common.status}
              <select
                name="status"
                value={draft.status}
                onChange={(e) => setDraft((p) => ({ ...p, status: e.target.value }))}
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
              onChange={(e) =>
                setDraft((p) => ({ ...p, sort_order: Number(e.target.value) }))
              }
              style={adminInput}
            />
          </label>
        </div>

        <label style={{ fontSize: 13 }}>
          {t.common.serviceKey}
          <input
            name="service_key"
            value={draft.service_key}
            onChange={(e) => setDraft((p) => ({ ...p, service_key: e.target.value }))}
            style={adminInput}
          />
          <span style={{ fontSize: 11, color: "#666", marginTop: 4, display: "block" }}>
            {t.common.serviceKeyHint}
          </span>
        </label>

        <div
          style={{
            position: "sticky",
            bottom: 0,
            background: "linear-gradient(transparent, #0c0c0c 30%)",
            paddingTop: 20,
            display: "grid",
            gap: 8,
          }}
        >
          <button type="submit" style={{ ...adminBtnPrimary, width: "100%" }} disabled={busy}>
            {busy ? t.common.saving : t.common.saveCard}
          </button>
          <button
            type="submit"
            formAction={hardNavAction(deleteServiceAction)}
            style={{
              ...adminBtn,
              width: "100%",
              color: "#f66",
              borderColor: "#633",
              background: "transparent",
            }}
            onClick={(e) => {
              if (!confirm(t.common.confirmDelete)) e.preventDefault();
            }}
          >
            {t.common.delete}
          </button>
        </div>
      </HardNavForm>
    </aside>
  );
}
