"use client";

import {
  hardNavCreate,
  runAdminMutation,
} from "@/components/admin/HardNavForm";
import {
  FormikCheckbox,
  FormikSelect,
  FormikTextField,
} from "@/components/admin/form/FormikFields";
import { AdminFormikForm } from "@/components/admin/form/AdminFormikForm";
import {
  adminToastError,
  adminToastSuccess,
} from "@/components/admin/toast/AdminToaster";
import {
  isAdminFailure,
  isAdminSuccess,
} from "@/lib/cms/admin-redirect";
import { teamMemberSchema } from "@/lib/cms/admin-schemas";

import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
  type CSSProperties,
} from "react";
import { ImageField } from "@/components/admin/image-field";
import {
  formatUploadError,
  uploadMediaViaApi,
} from "@/lib/cms/browser-upload";
import {
  createTeamMemberAction,
  deleteTeamMemberAction,
  reorderTeamMembersAction,
  saveTeamMemberAction,
} from "@/app/admin/(dashboard)/team/actions";
import {
  ADMIN_LOCALES,
  isLocaleFilled,
  localizationScore,
  type AdminLocale,
  type TeamMemberDraft,
  type TeamTranslationDraft,
} from "./types";
import { adminPanel } from "@/components/admin/ui/styles";
import { formatAdminMessage, useAdminT } from "@/i18n/admin";

type Props = {
  items: TeamMemberDraft[];
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

function SiteMemberCard({
  item,
  locale,
  selected,
  director,
}: {
  item: TeamMemberDraft;
  locale: AdminLocale;
  selected?: boolean;
  director?: boolean;
}) {
  const t = useAdminT();
  const tr = item.translations[locale];
  const score = localizationScore(item.translations);
  const published = item.status === "published";
  const roleClass = director
    ? "agency-team__director-role"
    : "agency-team__member-role";
  const nameClass = director
    ? "agency-team__director-name"
    : "agency-team__member-name";
  const photoClass = director
    ? "agency-team__director-photo"
    : "agency-team__member-photo";

  return (
    <article
      className={director ? "agency-team__director" : "agency-team__member"}
      style={{
        outline: selected ? "2px solid #2600ff" : undefined,
        outlineOffset: 4,
        opacity: published ? 1 : 0.7,
        maxWidth: director ? undefined : undefined,
        width: "100%",
      }}
    >
      <div className={photoClass} style={{ position: "relative" }}>
        {item.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.image}
            alt=""
            className="agency-team__photo-img"
            style={{
              objectFit: "cover",
              objectPosition: item.image_object_position || "center",
            }}
          />
        ) : (
          <div
            className="agency-team__photo-img"
            style={{
              display: "grid",
              placeItems: "center",
              background: "#161616",
              color: "#555",
              fontSize: 13,
            }}
          >
            {t.pages.team.noPhoto}
          </div>
        )}
        <span
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            padding: "3px 8px",
            background: "rgba(0,0,0,0.7)",
            fontSize: 10,
            color: published ? "#8c8" : "#a86",
            fontWeight: 600,
          }}
        >
          {published ? t.common.published : t.common.draft} · {score.filled}/3
        </span>
      </div>
      <p className={roleClass}>{tr.role.trim() || t.common.role}</p>
      <p className={nameClass}>{tr.name.trim() || t.common.name}</p>
    </article>
  );
}

function SortableMember({
  item,
  locale,
  selected,
  onOpen,
}: {
  item: TeamMemberDraft;
  locale: AdminLocale;
  selected?: boolean;
  onOpen: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });
  const dragMoved = useRef(false);

  useEffect(() => {
    if (isDragging) dragMoved.current = true;
  }, [isDragging]);

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.85 : 1,
        zIndex: isDragging ? 2 : 1,
        cursor: isDragging ? "grabbing" : "grab",
        touchAction: "none",
      }}
      {...attributes}
      {...listeners}
      onClick={() => {
        if (dragMoved.current) {
          dragMoved.current = false;
          return;
        }
        onOpen();
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen();
        }
      }}
    >
      <SiteMemberCard item={item} locale={locale} selected={selected} />
    </div>
  );
}

export function TeamEditor({ items, initialEditId = null, embedded = false }: Props) {
  const t = useAdminT();
  const [boardLocale, setBoardLocale] = useState<AdminLocale>("en");
  const [selectedId, setSelectedId] = useState<string | null>(initialEditId);
  const [ordered, setOrdered] = useState(items);
  const [pending, startTransition] = useTransition();
  const [savedOrder, setSavedOrder] = useState(false);
  const [syncedItems, setSyncedItems] = useState(items);
  if (items !== syncedItems) {
    setSyncedItems(items);
    setOrdered(items);
  }

  const selected = useMemo(
    () => ordered.find((item) => item.id === selectedId) ?? null,
    [ordered, selectedId],
  );

  const directors = useMemo(
    () => ordered.filter((item) => item.is_director),
    [ordered],
  );
  const members = useMemo(
    () => ordered.filter((item) => !item.is_director),
    [ordered],
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = members.findIndex((m) => m.id === active.id);
    const newIndex = members.findIndex((m) => m.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    const nextMembers = arrayMove(members, oldIndex, newIndex);
    const nextOrdered = [...directors, ...nextMembers];
    setOrdered(nextOrdered);
    setSavedOrder(false);

    startTransition(async () => {
      try {
        const result = await reorderTeamMembersAction(
          nextMembers.map((m) => m.id),
        );
        if (isAdminFailure(result)) {
          adminToastError(result.error);
          setOrdered(items);
          return;
        }
        if (isAdminSuccess(result)) {
          adminToastSuccess(result.message ?? t.common.orderSaved);
        }
        setSavedOrder(true);
      } catch (err) {
        adminToastError(
          err instanceof Error ? err.message : t.common.actionFailed,
        );
        setOrdered(items);
      }
    });
  };

  return (
    <div className="admin-team-cms">
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
          {!embedded ? (
            <h1 style={{ fontSize: 32, margin: 0 }}>{t.pages.team.title}</h1>
          ) : (
            <h2 style={{ fontSize: 18, margin: 0 }}>{t.pages.team.title}</h2>
          )}
          <p style={{ color: "#888", margin: "8px 0 0" }}>{t.pages.team.description}</p>
          {pending ? (
            <p style={{ color: "#aaa", fontSize: 12, margin: "6px 0 0" }}>
              {t.common.saving}
            </p>
          ) : null}
          {savedOrder && !pending ? (
            <p style={{ color: "#6f6", fontSize: 12, margin: "6px 0 0" }}>
              {t.common.orderSaved}
            </p>
          ) : null}
        </div>
        <form
          action={hardNavCreate(createTeamMemberAction, {
            successMessage: t.common.created,
            fallbackError: t.common.actionFailed,
            defaultSaved: t.common.saved,
            defaultReady: t.common.ready,
          })}
        >
          <button type="submit" style={btnPrimary}>
            + {t.pages.team.newItem}
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

      <section className="agency-team" style={{ marginTop: 0 }}>
        <div className="agency-team__head">
          <h2
            className="agency-team__title text-h2 text-white"
            style={{ margin: 0, fontSize: 28 }}
          >
            {t.pages.team.title}
          </h2>
          <div>
            {directors[0] ? (
              <button
                type="button"
                onClick={() => setSelectedId(directors[0].id)}
                style={{
                  all: "unset",
                  cursor: "pointer",
                  display: "block",
                  width: "100%",
                }}
              >
                <SiteMemberCard
                  item={directors[0]}
                  locale={boardLocale}
                  selected={directors[0].id === selectedId}
                  director
                />
              </button>
            ) : (
              <p style={{ color: "#666", margin: 0, fontSize: 13 }}>
                {t.pages.team.noDirector}
              </p>
            )}
            {directors.length > 1 ? (
              <p style={{ color: "#888", fontSize: 12, marginTop: 12 }}>
                {formatAdminMessage(t.pages.team.extraDirectors, {
                  count: directors.length - 1,
                })}
              </p>
            ) : null}
          </div>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={onDragEnd}
        >
          <SortableContext
            items={members.map((m) => m.id)}
            strategy={rectSortingStrategy}
          >
            <div className="agency-team__grid">
              {members.map((item) => (
                <SortableMember
                  key={item.id}
                  item={item}
                  locale={boardLocale}
                  selected={item.id === selectedId}
                  onOpen={() => setSelectedId(item.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </section>

      {ordered.length === 0 ? (
        <p style={{ color: "#888", marginTop: 24 }}>{t.pages.team.empty}</p>
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
          <TeamEditPanel
            key={selected.id}
            item={selected}
            onClose={() => setSelectedId(null)}
          />
        </>
      ) : null}
    </div>
  );
}

function TeamEditPanel({
  item,
  onClose,
}: {
  item: TeamMemberDraft;
  onClose: () => void;
}) {
  const t = useAdminT();
  const [locale, setLocale] = useState<AdminLocale>("en");
  const [previewImage, setPreviewImage] = useState(item.image);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const initialValues = {
    status: (item.status === "published" ? "published" : "draft") as
      | "draft"
      | "published",
    sort_order: item.sort_order,
    is_director: item.is_director,
    image_object_position: item.image_object_position ?? "",
    en_name: item.translations.en.name,
    en_role: item.translations.en.role,
    de_name: item.translations.de.name,
    de_role: item.translations.de.role,
  };

  return (
    <aside style={adminPanel} role="dialog" aria-label={t.pages.team.editTitle}>
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
          <strong style={{ fontSize: 16 }}>{t.pages.team.editTitle}</strong>
        </div>
        <button type="button" style={btn} onClick={onClose}>
          {t.common.close}
        </button>
      </div>

      <AdminFormikForm
        initialValues={initialValues}
        validationSchema={teamMemberSchema}
        action={saveTeamMemberAction}
        successMessage={t.common.saved}
        style={{
          flex: 1,
          overflow: "auto",
          padding: 18,
          display: "grid",
          gap: 16,
          alignContent: "start",
        }}
        toFormData={async (values) => {
          const fd = new FormData();
          fd.set("id", item.id);
          fd.set("status", values.status);
          fd.set("sort_order", String(values.sort_order));
          fd.set("image_object_position", values.image_object_position);
          if (values.is_director) fd.set("is_director", "on");
          for (const code of ["en", "de"] as const) {
            fd.set(`${code}_name`, values[`${code}_name` as const]);
            fd.set(`${code}_role`, values[`${code}_role` as const]);
          }

          let imageUrl = previewImage.startsWith("blob:")
            ? item.image
            : previewImage;

          const file = fileRef.current?.files?.[0];
          if (file) {
            try {
              const uploaded = await uploadMediaViaApi(file, {
                folder: `team/${item.id}`,
                filenameHint: "photo",
              });
              imageUrl = uploaded.publicUrl;
            } catch (err) {
              throw new Error(
                formatUploadError(
                  err instanceof Error ? err.message : t.common.actionFailed,
                  t.common.uploadNetworkError,
                ),
              );
            }
          }

          fd.set("image", imageUrl);
          return fd;
        }}
      >
        {({ values, setFieldValue, isSubmitting }) => {
          const draftView: TeamMemberDraft = {
            ...item,
            status: values.status,
            sort_order: values.sort_order,
            is_director: values.is_director,
            image_object_position: values.image_object_position,
            image: previewImage,
            translations: {
              en: {
                locale: "en",
                name: values.en_name,
                role: values.en_role,
              },
              de: {
                locale: "de",
                name: values.de_name,
                role: values.de_role,
              },
            },
          };
          const score = localizationScore(draftView.translations);
          const nameKey = `${locale}_name` as const;
          const roleKey = `${locale}_role` as const;

          return (
            <>
              <p style={{ margin: 0, fontSize: 12, color: "#888" }}>
                {formatAdminMessage(t.common.localesFilled, {
                  filled: score.filled,
                  total: score.total,
                })}
              </p>

              <div style={{ pointerEvents: "none", maxWidth: 280 }}>
                <SiteMemberCard
                  item={draftView}
                  locale={locale}
                  director={values.is_director}
                />
              </div>

              <div>
                <p style={{ margin: "0 0 8px", fontSize: 12, color: "#888" }}>
                  {t.common.contentLanguage}
                </p>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {ADMIN_LOCALES.map((l) => {
                    const filled = isLocaleFilled(draftView.translations[l.code]);
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
              </div>

              <FormikTextField
                label={`${t.common.name} (${locale.toUpperCase()})`}
                name={nameKey}
                placeholder={t.profile.displayNamePlaceholder}
              />
              <FormikTextField
                label={`${t.common.role} (${locale.toUpperCase()})`}
                name={roleKey}
                placeholder={t.profile.jobTitlePlaceholder}
              />

              {locale !== "en" ? (
                <button
                  type="button"
                  style={btn}
                  onClick={() => {
                    void setFieldValue(`${locale}_name`, values.en_name);
                    void setFieldValue(`${locale}_role`, values.en_role);
                  }}
                >
                  {t.common.copyFromEn}
                </button>
              ) : (
                <p style={{ margin: 0, fontSize: 12, color: "#666" }}>
                  Заполни RU первым — потом можно копировать в UZ/EN.
                </p>
              )}

              <div
                className="admin-form-2col"
              >
                <FormikSelect label={t.common.status} name="status">
                  <option value="draft">{t.common.draft}</option>
                  <option value="published">{t.common.published}</option>
                </FormikSelect>
                <FormikTextField label={t.common.position} name="sort_order" type="number" />
              </div>

              <FormikCheckbox
                label={t.common.showAsDirector}
                name="is_director"
              />

              <FormikTextField
                label={t.common.cropLabel}
                name="image_object_position"
                placeholder={t.common.cropExample}
              />

              <ImageField
                name="image_file"
                preset="team"
                currentUrl={previewImage || null}
                label={t.common.photo}
                previewTitle={values[nameKey] || t.common.name}
                previewSubtitle={values[roleKey] || t.common.roleTitle}
                onReady={(file) => {
                  const input = document.querySelector<HTMLInputElement>(
                    `input[type="file"][name="image_file"]`,
                  );
                  fileRef.current = input;
                  if (!file) return;
                  const url = URL.createObjectURL(file);
                  setPreviewImage(url);
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
                <button type="submit" style={btnPrimary} disabled={isSubmitting}>
                  {isSubmitting ? t.common.saving : t.common.saveCard}
                </button>
                <button
                  type="button"
                  style={{ ...btn, color: "#f66", borderColor: "#633" }}
                  disabled={isSubmitting}
                  onClick={() => {
                    if (!confirm(t.common.confirmDelete)) return;
                    const fd = new FormData();
                    fd.set("id", item.id);
                    void runAdminMutation(deleteTeamMemberAction, fd, {
                      successMessage: t.common.saved,
                    });
                  }}
                >
                  {t.common.delete}
                </button>
              </div>
            </>
          );
        }}
      </AdminFormikForm>
    </aside>
  );
}
