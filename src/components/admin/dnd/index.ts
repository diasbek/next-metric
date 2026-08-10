"use client";

import dynamic from "next/dynamic";
import {
  ReorderStatus,
  SortableCard,
  SortableCardGrid as SortableCardGridImpl,
  useOrderedItems,
  usePersistReorder,
} from "./SortableCardGrid";

export {
  ReorderStatus,
  SortableCard,
  useOrderedItems,
  usePersistReorder,
};

/** Lazy DnD grid — keeps @dnd-kit out of initial admin chunks until mounted. */
export const SortableCardGrid = dynamic(
  () => import("./SortableCardGrid").then((m) => m.SortableCardGrid),
  { ssr: false },
) as typeof SortableCardGridImpl;
