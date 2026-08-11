"use client";

import {
  HardNavForm,
  hardNavAction,
  hardNavCreate,
  runAdminMutation,
} from "@/components/admin/HardNavForm";
import {
  ReorderStatus,
  SortableCard,
  SortableCardGrid,
  useOrderedItems,
  usePersistReorder,
} from "@/components/admin/dnd";
import {
  adminToastError,
} from "@/components/admin/toast/AdminToaster";
import {
  formatUploadError,
  uploadMediaViaApi,
} from "@/lib/cms/browser-upload";

import { useMemo, useState, type CSSProperties, type FormEvent } from "react";
import { ImageField } from "@/components/admin/image-field";
import {
  createTestimonialAction,
  deleteTestimonialAction,
  reorderTestimonialsAction,
  saveTestimonialAction,
} from "@/app/admin/(dashboard)/testimonials/actions";
import {
  ADMIN_LOCALES,
  isLocaleFilled,
  localizationScore,
  type AdminLocale,
  type TestimonialDraft,
} from "./types";
import { formatAdminMessage, useAdminT } from "@/i18n/admin";
import { adminPanel } from "@/components/admin/ui/styles";

type Props = {
  items: TestimonialDraft[];
  initialEditId?: string | null;
  embedded?: boolean;
};


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

const btnPrimary: CSSProperties = {
  ...btn,
  background: "#2600ff",
  borderColor: "#2600ff",
  fontWeight: 600,
};

const cardShell: CSSProperties = {
  display: "flex",
  height: "100%",
  minHeight: 280,
  flexDirection: "column",
  gap: 16,
  border: "1px solid #333",
  background: "#0a0a0a",
  padding: 18,
  color: "#fff",
  boxSizing: "border-box",
};

const cardRole: CSSProperties = {
  margin: 0,
  fontSize: 13,
  fontWeight: 500,
  lineHeight: 1.25,
  color: "#aaa",
  overflow: "hidden",
  display: "-webkit-box",
  WebkitLineClamp: 1,
  WebkitBoxOrient: "vertical",
};

const cardQuote: CSSProperties = {
  margin: 0,
  fontSize: 16,
  fontWeight: 500,
  lineHeight: 1.3,
  letterSpacing: "-0.02em",
  color: "#fff",
  overflow: "hidden",
  display: "-webkit-box",
  WebkitLineClamp: 5,
  WebkitBoxOrient: "vertical",
  flex: 1,
  minHeight: 0,
};

const avatarBox = (rounded?: string): CSSProperties => ({
  position: "relative",
  width: 48,
  height: 48,
  flexShrink: 0,
  overflow: "hidden",
  background: "#161616",
  border: "1px solid #2a2a2a",
  borderRadius:
    rounded === "full" ? "999px" : rounded === "lg" ? 10 : 0,
});

function AvatarSlot({
  src,
  objectPosition,
  rounded,
  emptyLabel,
}: {
  src: string;
  objectPosition?: string;
  rounded?: string;
  emptyLabel: string;
}) {
  return (
    <div style={avatarBox(rounded)}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt=""
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: objectPosition || "center",
          }}
        />
      ) : (
        <span
          style={{
            display: "flex",
            width: "100%",
            height: "100%",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 9,
            color: "#555",
            textAlign: "center",
            lineHeight: 1.1,
            padding: 4,
          }}
        >
          {emptyLabel}
        </span>
      )}
    </div>
  );
}

function CardFace({
  item,
  locale,
  selected,
  onClick,
  interactive = true,
}: {
  item: TestimonialDraft;
  locale: AdminLocale;
  selected?: boolean;
  onClick?: () => void;
  interactive?: boolean;
}) {
  const t = useAdminT();
  const tr = item.translations[locale];
  const score = localizationScore(item.translations);
  const published = item.status === "published";

  const body = (
    <article style={cardShell}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 10,
          flex: 1,
          minHeight: 0,
        }}
      >
        <p style={cardRole}>{tr.role.trim() || t.common.roleTitle}</p>
        <p style={cardQuote}>
          «{tr.quote.trim() || t.pages.testimonials.quotePlaceholder}»
        </p>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginTop: "auto",
        }}
      >
        <AvatarSlot
          src={item.person_image}
          objectPosition={item.person_object_position}
          emptyLabel={t.common.photo}
        />
        <AvatarSlot
          src={item.logo_image}
          rounded={item.logo_rounded}
          emptyLabel={t.common.logo}
        />
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 8,
          paddingTop: 10,
          borderTop: "1px solid #222",
          fontSize: 11,
          color: "#777",
        }}
      >
        <span
          style={{
            color: published ? "#8c8" : "#a86",
            fontWeight: 600,
          }}
        >
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

  const wrapStyle: CSSProperties = {
    display: "block",
    width: "100%",
    height: "100%",
    textAlign: "left",
    boxSizing: "border-box",
    outline: selected ? "2px solid #2600ff" : "1px solid transparent",
    outlineOffset: 3,
  };

  if (!interactive) {
    return <div style={wrapStyle}>{body}</div>;
  }

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

export function TestimonialsEditor({ items, initialEditId = null, embedded = false }: Props) {
  const t = useAdminT();
  const [boardLocale, setBoardLocale] = useState<AdminLocale>("en");
  const [selectedId, setSelectedId] = useState<string | null>(initialEditId);
  const [ordered, setOrdered] = useOrderedItems(items);
  const { pending, saved, onDragEnd } = usePersistReorder(
    items,
    ordered,
    setOrdered,
    reorderTestimonialsAction,
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
          {!embedded ? <h1 style={{ fontSize: 32, margin: 0 }}>{t.pages.testimonials.title}</h1> : <h2 style={{ fontSize: 18, margin: 0 }}>{t.pages.testimonials.title}</h2>}
          <p style={{ color: "#888", margin: "8px 0 0" }}>{t.pages.testimonials.description}</p>
          <ReorderStatus pending={pending} saved={saved} />
        </div>
        <form
          action={hardNavCreate(createTestimonialAction, {
            successMessage: t.common.created,
            fallbackError: t.common.actionFailed,
            defaultSaved: t.common.saved,
            defaultReady: t.common.ready,
          })}
        >
          <button type="submit" style={btnPrimary}>
            + {t.pages.testimonials.newItem}
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
              ...btn,
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
        renderItem={(item) => (
          <SortableCard
            id={item.id}
            onActivate={() => setSelectedId(item.id)}
            style={{ minHeight: 280 }}
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
        <p style={{ color: "#888", marginTop: 24 }}>{t.pages.testimonials.empty}</p>
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
          <TestimonialEditPanel
            key={selected.id}
            item={selected}
            onClose={() => setSelectedId(null)}
          />
        </>
      ) : null}
    </div>
  );
}

function TestimonialEditPanel({
  item,
  onClose,
}: {
  item: TestimonialDraft;
  onClose: () => void;
}) {
  const t = useAdminT();
  const [locale, setLocale] = useState<AdminLocale>("en");
  const [draft, setDraft] = useState(item);
  const [busy, setBusy] = useState(false);

  const tr = draft.translations[locale];
  const score = localizationScore(draft.translations);

  const updateLocale = (patch: Partial<TestimonialTranslationDraft>) => {
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
        [locale]: {
          ...prev.translations[locale],
          role: ru.role,
          quote: ru.quote,
        },
      },
    }));
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    try {
      const form = event.currentTarget;
      const fd = new FormData(form);

      const personInput = form.querySelector<HTMLInputElement>(
        'input[type="file"][name="person_image_file"]',
      );
      const logoInput = form.querySelector<HTMLInputElement>(
        'input[type="file"][name="logo_image_file"]',
      );
      const personFile = personInput?.files?.[0];
      const logoFile = logoInput?.files?.[0];

      let personImage = draft.person_image.startsWith("blob:")
        ? item.person_image
        : draft.person_image;
      let logoImage = draft.logo_image.startsWith("blob:")
        ? item.logo_image
        : draft.logo_image;

      if (personFile) {
        const uploaded = await uploadMediaViaApi(personFile, {
          folder: `testimonials/${item.id}/person`,
          filenameHint: "person",
        });
        personImage = uploaded.publicUrl;
      }
      if (logoFile) {
        const uploaded = await uploadMediaViaApi(logoFile, {
          folder: `testimonials/${item.id}/logo`,
          filenameHint: "logo",
        });
        logoImage = uploaded.publicUrl;
      }

      fd.set("person_image", personImage);
      fd.set("logo_image", logoImage);
      fd.delete("person_image_file");
      fd.delete("logo_image_file");

      const ok = await runAdminMutation(saveTestimonialAction, fd, {
        successMessage: t.pages.testimonials.saved,
      });
      if (!ok) setBusy(false);
    } catch (err) {
      adminToastError(
        formatUploadError(
          err instanceof Error ? err.message : t.common.actionFailed,
          t.common.uploadNetworkError,
        ),
      );
      setBusy(false);
    }
  };

  return (
    <aside style={adminPanel} role="dialog" aria-label={t.pages.testimonials.editTitle}>
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
          <strong style={{ fontSize: 16 }}>{t.pages.testimonials.editTitle}</strong>
          <p style={{ margin: "4px 0 0", fontSize: 12, color: "#888" }}>
            {formatAdminMessage(t.common.localesFilled, {
              filled: score.filled,
              total: score.total,
            })}
          </p>
        </div>
        <button type="button" style={btn} onClick={onClose}>
          {t.common.close}
        </button>
      </div>

      <HardNavForm
        action={saveTestimonialAction}
        encType="multipart/form-data"
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
        <input type="hidden" name="person_image" value={item.person_image} />
        <input type="hidden" name="logo_image" value={item.logo_image} />
        {ADMIN_LOCALES.map((l) => (
          <div key={l.code}>
            <input
              type="hidden"
              name={`${l.code}_role`}
              value={draft.translations[l.code].role}
            />
            <input
              type="hidden"
              name={`${l.code}_quote`}
              value={draft.translations[l.code].quote}
            />
          </div>
        ))}

        <div style={{ pointerEvents: "none", height: 280 }}>
          <CardFace item={draft} locale={locale} interactive={false} />
        </div>

        <div>
          <p style={{ margin: "0 0 8px", fontSize: 12, color: "#888" }}>
            {t.common.contentLanguage}
          </p>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {ADMIN_LOCALES.map((l) => {
              const filled = isLocaleFilled(draft.translations[l.code]);
              const active = locale === l.code;
              return (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => setLocale(l.code)}
                  style={{
                    ...btn,
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
          <p style={{ margin: "8px 0 0", fontSize: 12, color: "#aaa" }}>
            {formatAdminMessage(t.common.editingLocale, {
              locale:
                ADMIN_LOCALES.find((l) => l.code === locale)?.short ??
                locale.toUpperCase(),
            })}
          </p>
        </div>

        <label style={{ display: "grid", gap: 4, fontSize: 13 }}>
          {t.pages.testimonials.roleLabel} ({locale.toUpperCase()})
          <input
            value={tr.role}
            onChange={(e) => updateLocale({ role: e.target.value })}
            placeholder={t.pages.testimonials.rolePlaceholder}
            style={input}
          />
        </label>

        <label style={{ display: "grid", gap: 4, fontSize: 13 }}>
          {t.pages.testimonials.quoteLabel} ({locale.toUpperCase()})
          <textarea
            value={tr.quote}
            onChange={(e) => updateLocale({ quote: e.target.value })}
            placeholder={t.pages.testimonials.quotePlaceholder}
            rows={5}
            style={{ ...input, resize: "vertical" }}
          />
        </label>

        {locale !== "en" ? (
          <button type="button" style={btn} onClick={copyFromEn}>
            {t.common.copyFromEn}
          </button>
        ) : (
          <p style={{ margin: 0, fontSize: 12, color: "#666" }}>
            {t.common.fillEnFirst}
          </p>
        )}

        <div className="admin-form-2col">
          <label style={{ fontSize: 13 }}>
            {t.common.status}
              <select
                name="status"
                value={draft.status}
                onChange={(e) => setDraft((p) => ({ ...p, status: e.target.value }))}
                style={input}
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
              style={input}
            />
          </label>
        </div>

        <label style={{ fontSize: 13 }}>
          {t.common.logoRounded}
          <select
            name="logo_rounded"
            value={draft.logo_rounded}
            onChange={(e) =>
              setDraft((p) => ({ ...p, logo_rounded: e.target.value }))
            }
            style={input}
          >
            <option value="">{t.common.logoRoundedNone}</option>
            <option value="lg">{t.common.logoRoundedSoft}</option>
            <option value="full">{t.common.logoRoundedCircle}</option>
          </select>
        </label>

        <label style={{ fontSize: 13 }}>
          {t.common.cropLabel}
          <input
            name="person_object_position"
            value={draft.person_object_position}
            onChange={(e) =>
              setDraft((p) => ({
                ...p,
                person_object_position: e.target.value,
              }))
            }
            placeholder={t.common.cropExample}
            style={input}
          />
        </label>

        <ImageField
          name="person_image_file"
          preset="avatar"
          currentUrl={draft.person_image || null}
          label={t.common.photo}
          previewTitle={tr.role || t.common.name}
          previewSubtitle={tr.role || t.common.roleTitle}
          previewQuote={tr.quote || t.common.quote}
          onReady={(file) => {
            if (!file) return;
            const url = URL.createObjectURL(file);
            setDraft((p) => ({ ...p, person_image: url }));
          }}
        />

        <ImageField
          name="logo_image_file"
          preset="logo"
          currentUrl={draft.logo_image || null}
          label={t.common.logo}
          previewTitle={tr.role || t.common.name}
          onReady={(file) => {
            if (!file) return;
            const url = URL.createObjectURL(file);
            setDraft((p) => ({ ...p, logo_image: url }));
          }}
        />

        <div
          style={{
            position: "sticky",
            bottom: 0,
            background: "linear-gradient(transparent, #0c0c0c 30%)",
            paddingTop: 20,
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
          }}
        >
          <button type="submit" style={btnPrimary} disabled={busy}>
            {busy ? t.common.saving : t.common.saveCard}
          </button>
          <button
            type="submit"
            formAction={hardNavAction(deleteTestimonialAction)}
            style={{ ...btn, color: "#f66", borderColor: "#633" }}
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

// Local alias for the translation type used above
type TestimonialTranslationDraft = TestimonialDraft["translations"][AdminLocale];
