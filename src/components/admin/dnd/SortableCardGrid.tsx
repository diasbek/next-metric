"use client";

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
  useState,
  useTransition,
  type CSSProperties,
  type ReactNode,
} from "react";
import {
  adminToastError,
  adminToastSuccess,
} from "@/components/admin/toast/AdminToaster";
import {
  isAdminFailure,
  isAdminSuccess,
  type AdminActionResult,
} from "@/lib/cms/admin-redirect";
import { useAdminT } from "@/i18n/admin";

type Identifiable = { id: string };

/** Keep local order in sync with server props after create/delete/refresh. */
export function useOrderedItems<T extends Identifiable>(items: T[]) {
  const [ordered, setOrdered] = useState(items);
  const [synced, setSynced] = useState(items);
  if (items !== synced) {
    setSynced(items);
    setOrdered(items);
  }
  return [ordered, setOrdered] as const;
}

type PersistOrder = (orderedIds: string[]) => Promise<AdminActionResult>;

export function usePersistReorder<T extends Identifiable>(
  items: T[],
  ordered: T[],
  setOrdered: (next: T[]) => void,
  persist: PersistOrder,
) {
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const t = useAdminT();

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = ordered.findIndex((item) => item.id === active.id);
    const newIndex = ordered.findIndex((item) => item.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    const next = arrayMove(ordered, oldIndex, newIndex);
    setOrdered(next);
    setSaved(false);

    startTransition(async () => {
      try {
        const result = await persist(next.map((item) => item.id));
        if (isAdminFailure(result)) {
          adminToastError(result.error);
          setOrdered(items);
          return;
        }
        if (isAdminSuccess(result)) {
          adminToastSuccess(result.message ?? t.common.saved);
        }
        setSaved(true);
      } catch (err) {
        adminToastError(
          err instanceof Error ? err.message : t.common.actionFailed,
        );
        setOrdered(items);
      }
    });
  };

  return { pending, saved, onDragEnd };
}

export function ReorderStatus({
  pending,
  saved,
}: {
  pending: boolean;
  saved: boolean;
}) {
  const t = useAdminT();
  if (pending) {
    return (
      <p style={{ color: "#aaa", fontSize: 12, margin: "6px 0 0" }}>
        {t.common.saving}
      </p>
    );
  }
  if (saved) {
    return (
      <p style={{ color: "#6f6", fontSize: 12, margin: "6px 0 0" }}>
        {t.common.orderSaved}
      </p>
    );
  }
  return null;
}

function DragHandle({
  attributes,
  listeners,
}: {
  attributes: ReturnType<typeof useSortable>["attributes"];
  listeners: ReturnType<typeof useSortable>["listeners"];
}) {
  const t = useAdminT();
  return (
    <button
      type="button"
      aria-label={t.chrome.reorder}
      style={{
        position: "absolute",
        top: 8,
        right: 8,
        zIndex: 3,
        width: 36,
        height: 36,
        borderRadius: 0,
        border: "1px solid #333",
        background: "rgba(20,20,20,0.92)",
        color: "#ccc",
        cursor: "grab",
        display: "grid",
        placeItems: "center",
        touchAction: "none",
        padding: 0,
      }}
      {...attributes}
      {...listeners}
      onClick={(e) => e.stopPropagation()}
    >
      <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
        <circle cx="4" cy="3" r="1.2" fill="currentColor" />
        <circle cx="10" cy="3" r="1.2" fill="currentColor" />
        <circle cx="4" cy="7" r="1.2" fill="currentColor" />
        <circle cx="10" cy="7" r="1.2" fill="currentColor" />
        <circle cx="4" cy="11" r="1.2" fill="currentColor" />
        <circle cx="10" cy="11" r="1.2" fill="currentColor" />
      </svg>
    </button>
  );
}

export function SortableCard({
  id,
  onActivate,
  children,
  style,
}: {
  id: string;
  onActivate?: () => void;
  children: ReactNode;
  style?: CSSProperties;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  return (
    <div
      ref={setNodeRef}
      style={{
        position: "relative",
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.85 : 1,
        zIndex: isDragging ? 2 : 1,
        height: "100%",
        ...style,
      }}
    >
      <DragHandle attributes={attributes} listeners={listeners} />
      {onActivate ? (
        <div
          role="button"
          tabIndex={0}
          onClick={onActivate}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onActivate();
            }
          }}
          style={{ height: "100%", cursor: "pointer" }}
        >
          {children}
        </div>
      ) : (
        children
      )}
    </div>
  );
}

export function SortableCardGrid<T extends Identifiable>({
  items,
  onDragEnd,
  renderItem,
  style,
  disabled = false,
}: {
  items: T[];
  onDragEnd: (event: DragEndEvent) => void;
  renderItem: (item: T) => ReactNode;
  style?: CSSProperties;
  /** When true (e.g. filtered Works list), render static cards. */
  disabled?: boolean;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const gridStyle: CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 260px), 1fr))",
    gap: 16,
    alignItems: "stretch",
    ...style,
  };

  if (disabled) {
    return (
      <div style={gridStyle}>
        {items.map((item) => (
          <div key={item.id} style={{ height: "100%" }}>
            {renderItem(item)}
          </div>
        ))}
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
    >
      <SortableContext
        items={items.map((item) => item.id)}
        strategy={rectSortingStrategy}
      >
        <div style={gridStyle}>
          {items.map((item) => (
            <div key={item.id} style={{ height: "100%", minHeight: 0 }}>
              {renderItem(item)}
            </div>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
