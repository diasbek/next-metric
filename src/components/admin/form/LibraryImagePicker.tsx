"use client";

import { useId, useState, type CSSProperties } from "react";
import { adminInput } from "@/components/admin/ui/styles";
import { useAdminT } from "@/i18n/admin";

export type LibraryImageItem = {
  path: string;
  url: string;
};

type Props = {
  name: string;
  items: LibraryImageItem[];
  label: string;
  noneLabel: string;
  /** Called when selection changes (e.g. cover live preview). */
  onSelect?: (url: string) => void;
  /** Optional hint under the label (e.g. click-to-add). */
  hint?: string;
  /** Show the clear / none control. Default true. */
  showClear?: boolean;
};

const gridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(88px, 1fr))",
  gap: 8,
  maxHeight: 280,
  overflowY: "auto",
  padding: 8,
  border: "1px solid #2a2a2a",
  background: "#0c0c0c",
};

const cellBase: CSSProperties = {
  display: "grid",
  gap: 4,
  padding: 0,
  margin: 0,
  border: "1px solid #333",
  background: "#111",
  cursor: "pointer",
  textAlign: "left",
  color: "#aaa",
  width: "100%",
};

export function LibraryImagePicker({
  name,
  items,
  label,
  noneLabel,
  onSelect,
  hint,
  showClear = true,
}: Props) {
  const t = useAdminT();
  const listId = useId();
  const [value, setValue] = useState("");
  const [q, setQ] = useState("");

  if (items.length === 0) return null;

  const filtered = q.trim()
    ? items.filter((item) =>
        item.path.toLowerCase().includes(q.trim().toLowerCase()),
      )
    : items;

  const pick = (url: string) => {
    setValue(url);
    onSelect?.(url);
  };

  return (
    <div style={{ display: "grid", gap: 8 }}>
      <input type="hidden" name={name} value={value} />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 8,
          alignItems: "baseline",
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "grid", gap: 2, minWidth: 0 }}>
          <span style={{ fontSize: 13 }}>{label}</span>
          {hint ? (
            <span style={{ fontSize: 12, color: "#888" }}>{hint}</span>
          ) : null}
        </div>
        {showClear ? (
          <button
            type="button"
            onClick={() => pick("")}
            style={{
              padding: "4px 8px",
              fontSize: 12,
              cursor: "pointer",
              background: "transparent",
              border: "1px solid #333",
              color: value ? "#ccc" : "#666",
            }}
          >
            {noneLabel}
          </button>
        ) : null}
      </div>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={t.media.searchPlaceholder}
        style={{ ...adminInput, margin: 0 }}
        aria-controls={listId}
      />
      <div id={listId} role="listbox" aria-label={label} style={gridStyle}>
        {filtered.map((item) => {
          const selected = value === item.url;
          return (
            <button
              key={item.path}
              type="button"
              role="option"
              aria-selected={selected}
              title={item.path}
              onClick={() => pick(item.url)}
              style={{
                ...cellBase,
                borderColor: selected ? "#2600ff" : "#333",
                boxShadow: selected ? "0 0 0 1px #2600ff" : undefined,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.url}
                alt=""
                loading="lazy"
                decoding="async"
                width={88}
                height={66}
                style={{
                  width: "100%",
                  height: 66,
                  objectFit: "cover",
                  display: "block",
                  background: "#1a1a1a",
                }}
              />
              <span
                style={{
                  fontSize: 10,
                  lineHeight: 1.2,
                  padding: "0 4px 4px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {item.path.split("/").pop() || item.path}
              </span>
            </button>
          );
        })}
      </div>
      {filtered.length === 0 ? (
        <p style={{ margin: 0, fontSize: 12, color: "#666" }}>
          {t.common.emptyList}
        </p>
      ) : null}
    </div>
  );
}
