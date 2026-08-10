import type { CSSProperties } from "react";
import { ADMIN_TOPBAR_HEIGHT } from "@/components/admin/chrome/AdminTopBar";

export const ADMIN_TABBAR_RESERVE =
  "calc(72px + env(safe-area-inset-bottom, 0px))";

export const adminInput: CSSProperties = {
  width: "100%",
  padding: 10,
  background: "#111",
  border: "1px solid #333",
  color: "#fff",
  marginTop: 6,
  fontSize: 14,
  boxSizing: "border-box",
};

export const adminBtn: CSSProperties = {
  padding: "12px 16px",
  minHeight: 44,
  cursor: "pointer",
  border: "1px solid #444",
  background: "#1a1a1a",
  color: "#fff",
  fontSize: 13,
  boxSizing: "border-box",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
};

export const adminBtnPrimary: CSSProperties = {
  ...adminBtn,
  background: "#2600ff",
  borderColor: "#2600ff",
  fontWeight: 600,
};

/** @deprecated Prefer AdminDrawer — kept for gradual migration. */
export const adminPanel: CSSProperties = {
  position: "fixed",
  top: ADMIN_TOPBAR_HEIGHT,
  right: 0,
  bottom: 0,
  width: "min(460px, 100vw)",
  height: `calc(100svh - ${ADMIN_TOPBAR_HEIGHT}px)`,
  maxHeight: `calc(100svh - ${ADMIN_TOPBAR_HEIGHT}px)`,
  background: "#0c0c0c",
  borderLeft: "1px solid #333",
  zIndex: 100,
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  boxShadow: "-12px 0 40px rgba(0,0,0,0.45)",
  paddingBottom: ADMIN_TABBAR_RESERVE,
  boxSizing: "border-box",
};

export const adminFormGrid: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr)",
  gap: 12,
};

export const adminFormMaxWidth: CSSProperties = {
  maxWidth: 720,
  width: "100%",
};

export const clampLines = (lines: number): CSSProperties => ({
  margin: 0,
  overflow: "hidden",
  display: "-webkit-box",
  WebkitLineClamp: lines,
  WebkitBoxOrient: "vertical",
});
