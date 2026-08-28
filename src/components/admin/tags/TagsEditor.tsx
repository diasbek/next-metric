"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  createTagAction,
  deactivateTagAction,
  reorderTagsAction,
  saveTagAction,
} from "@/app/admin/(dashboard)/tags/actions";
import { HardNavForm } from "@/components/admin/HardNavForm";
import {
  ReorderStatus,
  SortableCard,
  SortableCardGrid,
  useOrderedItems,
  usePersistReorder,
} from "@/components/admin/dnd";
import {
  adminBtn,
  adminBtnPrimary,
  adminInput,
  adminPanel,
} from "@/components/admin/ui/styles";
import { useAdminT } from "@/i18n/admin";
import type { ResolvedTag } from "@/lib/cms/tags";
import type { TagKind } from "@/lib/cms/types";

type Props = {
  items: ResolvedTag[];
};

function TagRow({
  item,
  selected,
  categoryLabel,
  typeLabel,
  inactiveLabel,
}: {
  item: ResolvedTag;
  selected: boolean;
  categoryLabel: string;
  typeLabel: string;
  inactiveLabel: string;
}) {
  return (
    <article
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
        border: "1px solid #333",
        background: "#0a0a0a",
        padding: 16,
        minHeight: 96,
        boxSizing: "border-box",
        outline: selected ? "2px solid #2600ff" : "1px solid transparent",
        outlineOffset: 2,
        opacity: item.is_active ? 1 : 0.55,
      }}
    >
      <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "#fff" }}>
        {item.labels.en}
      </p>
      <p style={{ margin: 0, fontSize: 12, color: "#888" }}>
        {item.slug}
        {item.labels.de !== item.labels.en ? ` · DE: ${item.labels.de}` : ""}
      </p>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 11,
          color: "#777",
          marginTop: "auto",
          paddingTop: 8,
          borderTop: "1px solid #222",
        }}
      >
        <span>{item.kind === "category" ? categoryLabel : typeLabel}</span>
        <span style={{ color: item.is_active ? "#8c8" : "#a86" }}>
          {item.is_active ? "●" : inactiveLabel}
        </span>
      </div>
    </article>
  );
}

function TagPanel({
  item,
  onClose,
}: {
  item: ResolvedTag;
  onClose: () => void;
}) {
  const t = useAdminT();
  const [draft, setDraft] = useState({
    kind: item.kind,
    slug: item.slug,
    sort_order: item.sort_order,
    is_active: item.is_active,
    en_label: item.labels.en,
    de_label: item.labels.de,
  });

  return (
    <aside style={{ ...adminPanel, zIndex: 40 }} role="dialog">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          padding: "16px 18px",
          borderBottom: "1px solid #222",
        }}
      >
        <h2 style={{ margin: 0, fontSize: 18 }}>{t.pages.tags.editTitle}</h2>
        <button type="button" style={adminBtn} onClick={onClose}>
          {t.common.close}
        </button>
      </div>

      <HardNavForm
        action={saveTagAction}
        style={{
          flex: 1,
          overflow: "auto",
          padding: 18,
          display: "grid",
          gap: 12,
          alignContent: "start",
        }}
      >
        <input type="hidden" name="id" value={item.id} />
        <label style={{ fontSize: 13, display: "block", marginBottom: 12 }}>
          {t.pages.tags.kind}
          <select
            name="kind"
            value={draft.kind}
            onChange={(e) =>
              setDraft((p) => ({ ...p, kind: e.target.value as TagKind }))
            }
            style={adminInput}
          >
            <option value="category">{t.pages.tags.kindCategory}</option>
            <option value="type">{t.pages.tags.kindType}</option>
          </select>
        </label>
        <label style={{ fontSize: 13, display: "block", marginBottom: 12 }}>
          {t.pages.tags.slug}
          <input
            name="slug"
            value={draft.slug}
            onChange={(e) => setDraft((p) => ({ ...p, slug: e.target.value }))}
            style={adminInput}
          />
          <span style={{ display: "block", marginTop: 4, fontSize: 11, color: "#777" }}>
            {t.pages.tags.slugHint}
          </span>
        </label>
        <label style={{ fontSize: 13, display: "block", marginBottom: 12 }}>
          {t.pages.tags.labelEn}
          <input
            name="en_label"
            value={draft.en_label}
            onChange={(e) =>
              setDraft((p) => ({ ...p, en_label: e.target.value }))
            }
            style={adminInput}
          />
        </label>
        <label style={{ fontSize: 13, display: "block", marginBottom: 12 }}>
          {t.pages.tags.labelDe}
          <input
            name="de_label"
            value={draft.de_label}
            onChange={(e) =>
              setDraft((p) => ({ ...p, de_label: e.target.value }))
            }
            style={adminInput}
          />
        </label>
        <label style={{ fontSize: 13, display: "block", marginBottom: 12 }}>
          {t.pages.tags.sortOrder}
          <input
            name="sort_order"
            type="number"
            value={draft.sort_order}
            onChange={(e) =>
              setDraft((p) => ({
                ...p,
                sort_order: Number(e.target.value) || 0,
              }))
            }
            style={adminInput}
          />
        </label>
        <label
          style={{
            fontSize: 13,
            display: "flex",
            gap: 8,
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <input
            type="checkbox"
            checked={draft.is_active}
            onChange={(e) =>
              setDraft((p) => ({ ...p, is_active: e.target.checked }))
            }
          />
          {t.pages.tags.active}
        </label>
        {!draft.is_active ? (
          <input type="hidden" name="is_active" value="off" />
        ) : null}
        <button type="submit" style={{ ...adminBtnPrimary, width: "100%" }}>
          {t.common.save}
        </button>
      </HardNavForm>

      {item.is_active ? (
        <HardNavForm
          action={deactivateTagAction}
          style={{ padding: "0 18px 18px" }}
        >
          <input type="hidden" name="id" value={item.id} />
          <button type="submit" style={{ ...adminBtn, width: "100%" }}>
            {t.pages.tags.deactivate}
          </button>
        </HardNavForm>
      ) : null}
    </aside>
  );
}

function KindSection({
  kind,
  title,
  items,
  selectedId,
  onSelect,
}: {
  kind: TagKind;
  title: string;
  items: ResolvedTag[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const t = useAdminT();
  const [ordered, setOrdered] = useOrderedItems(items);
  const { pending, saved, onDragEnd } = usePersistReorder(
    items,
    ordered,
    setOrdered,
    reorderTagsAction,
  );

  return (
    <section style={{ marginBottom: 36 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
          marginBottom: 14,
          alignItems: "center",
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontSize: 18 }}>{title}</h2>
          <ReorderStatus pending={pending} saved={saved} />
        </div>
        <HardNavForm action={createTagAction} successMessage={t.common.created}>
          <input type="hidden" name="kind" value={kind} />
          <input
            type="hidden"
            name="en_label"
            value={kind === "category" ? "New category" : "New type"}
          />
          <input
            type="hidden"
            name="de_label"
            value={kind === "category" ? "Neue Kategorie" : "Neuer Typ"}
          />
          <button type="submit" style={adminBtnPrimary}>
            + {t.pages.tags.newItem}
          </button>
        </HardNavForm>
      </div>

      {ordered.length ? (
        <SortableCardGrid
          items={ordered}
          onDragEnd={onDragEnd}
          renderItem={(item) => (
            <SortableCard id={item.id} onActivate={() => onSelect(item.id)}>
              <TagRow
                item={item}
                selected={item.id === selectedId}
                categoryLabel={t.pages.tags.kindCategory}
                typeLabel={t.pages.tags.kindType}
                inactiveLabel={t.pages.tags.inactive}
              />
            </SortableCard>
          )}
        />
      ) : (
        <p style={{ color: "#888", fontSize: 14 }}>{t.pages.tags.empty}</p>
      )}
    </section>
  );
}

export function TagsEditor({ items }: Props) {
  const t = useAdminT();
  const searchParams = useSearchParams();
  const initialEdit = searchParams.get("edit");
  const [selectedId, setSelectedId] = useState<string | null>(initialEdit);

  const categories = useMemo(
    () => items.filter((i) => i.kind === "category"),
    [items],
  );
  const types = useMemo(
    () => items.filter((i) => i.kind === "type"),
    [items],
  );
  const selected = useMemo(
    () => items.find((i) => i.id === selectedId) ?? null,
    [items, selectedId],
  );

  return (
    <div>
      <KindSection
        kind="category"
        title={t.pages.tags.sectionCategory}
        items={categories}
        selectedId={selectedId}
        onSelect={setSelectedId}
      />
      <KindSection
        kind="type"
        title={t.pages.tags.sectionType}
        items={types}
        selectedId={selectedId}
        onSelect={setSelectedId}
      />

      {selected ? (
        <>
          <button
            type="button"
            aria-label={t.common.close}
            onClick={() => setSelectedId(null)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.45)",
              border: 0,
              zIndex: 30,
              cursor: "pointer",
            }}
          />
          <div
            style={{
              position: "fixed",
              top: 0,
              right: 0,
              bottom: 0,
              zIndex: 40,
              display: "flex",
            }}
          >
            <TagPanel key={selected.id} item={selected} onClose={() => setSelectedId(null)} />
          </div>
        </>
      ) : null}
    </div>
  );
}
