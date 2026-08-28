"use client";

import type { CSSProperties, ReactNode } from "react";

export type MediaSourceMode = "upload" | "library" | "url";

type Tab = {
  id: MediaSourceMode;
  label: string;
};

type Props = {
  mode: MediaSourceMode;
  onChange: (mode: MediaSourceMode) => void;
  tabs: Tab[];
  label: string;
  children: ReactNode;
};

const wrap: CSSProperties = {
  display: "flex",
  gap: 0,
  border: "1px solid #333",
  width: "fit-content",
  maxWidth: "100%",
  flexWrap: "wrap",
};

const tabStyle = (active: boolean, last: boolean): CSSProperties => ({
  padding: "8px 12px",
  minHeight: 40,
  cursor: "pointer",
  border: "none",
  borderRight: last ? "none" : "1px solid #333",
  background: active ? "#2600ff" : "#141414",
  color: active ? "#fff" : "#aaa",
  fontSize: 12,
  fontWeight: active ? 600 : 400,
});

export function MediaSourceTabs({ mode, onChange, tabs, label, children }: Props) {
  return (
    <div style={{ display: "grid", gap: 10 }}>
      <div role="tablist" aria-label={label} style={wrap}>
        {tabs.map((tab, i) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={mode === tab.id}
            onClick={() => onChange(tab.id)}
            style={tabStyle(mode === tab.id, i === tabs.length - 1)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {children}
    </div>
  );
}
