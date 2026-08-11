import type { CSSProperties } from "react";

export const fieldset: CSSProperties = {
  border: "1px solid #333",
  padding: 16,
  display: "grid",
  gap: 12,
  marginBottom: 16,
};

export const legend: CSSProperties = {
  padding: "0 6px",
  color: "#fff",
};

export const label: CSSProperties = {
  display: "block",
  fontSize: 12,
  color: "#aaa",
  marginBottom: 4,
};

export const cardBox: CSSProperties = {
  border: "1px solid #2a2a2a",
  background: "#0a0a0a",
  padding: 14,
  display: "grid",
  gap: 10,
};

export const row: CSSProperties = {
  display: "flex",
  gap: 8,
  flexWrap: "wrap",
  alignItems: "center",
};
