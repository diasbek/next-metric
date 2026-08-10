import type { CSSProperties } from "react";

/** Shared topbar control chrome (locale + profile triggers). */
export const adminChromeTrigger: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  minHeight: 40,
  minWidth: 40,
  padding: "6px 10px",
  borderRadius: 0,
  border: "1px solid #2a2a2a",
  background: "#111",
  color: "#fafafa",
  cursor: "pointer",
  boxSizing: "border-box",
  fontSize: 13,
  fontWeight: 600,
  lineHeight: 1.2,
};

export const adminChromeTriggerActive: CSSProperties = {
  background: "#1a1a1a",
};

export const adminChromeMenuPanel: CSSProperties = {
  position: "fixed",
  zIndex: 95,
  minWidth: 200,
  maxWidth: "min(320px, calc(100vw - 16px))",
  padding: 8,
  borderRadius: 0,
  border: "1px solid #2a2a2a",
  background: "#141414",
  boxShadow: "0 16px 40px rgba(0,0,0,0.55)",
  display: "grid",
  gap: 2,
  boxSizing: "border-box",
};

export const adminChromeMenuItem: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
  width: "100%",
  textAlign: "left",
  padding: "10px 12px",
  borderRadius: 0,
  border: "1px solid transparent",
  background: "transparent",
  color: "#fafafa",
  fontSize: 14,
  textDecoration: "none",
  cursor: "pointer",
  boxSizing: "border-box",
};

export const adminChromeMenuItemMuted: CSSProperties = {
  ...adminChromeMenuItem,
  border: "1px solid #333",
  marginTop: 4,
  justifyContent: "flex-start",
};

export const adminChromeNavLink: CSSProperties = {
  color: "#cfcfcf",
  textDecoration: "none",
  padding: "10px 12px",
  borderRadius: 0,
  fontSize: 13,
  lineHeight: 1.25,
  display: "flex",
  alignItems: "center",
  gap: 10,
  border: "1px solid transparent",
  boxSizing: "border-box",
};

export const adminChromeNavLinkActive: CSSProperties = {
  background: "#1a1a1a",
  borderColor: "#333",
  fontWeight: 600,
  color: "#fff",
};
