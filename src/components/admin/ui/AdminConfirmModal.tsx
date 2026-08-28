"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { adminBtn, adminBtnPrimary } from "@/components/admin/ui/styles";
import { useAdminT } from "@/i18n/admin";

export type AdminConfirmTone = "default" | "danger" | "accent";

type Props = {
  open: boolean;
  title: string;
  body: ReactNode;
  confirmLabel: string;
  tone?: AdminConfirmTone;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

const toneBtn: Record<AdminConfirmTone, typeof adminBtnPrimary> = {
  default: adminBtnPrimary,
  accent: {
    ...adminBtnPrimary,
    background: "#2600ff",
    borderColor: "#2600ff",
  },
  danger: {
    ...adminBtnPrimary,
    background: "#a11",
    borderColor: "#a11",
  },
};

export function AdminConfirmModal({
  open,
  title,
  body,
  confirmLabel,
  tone = "default",
  busy = false,
  onConfirm,
  onCancel,
}: Props) {
  const t = useAdminT();
  const titleId = useId();
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busy) onCancel();
    };
    window.addEventListener("keydown", onKey);
    const id = requestAnimationFrame(() => cancelRef.current?.focus());
    return () => {
      window.removeEventListener("keydown", onKey);
      cancelAnimationFrame(id);
    };
  }, [open, busy, onCancel]);

  if (!open) return null;

  return (
    <div
      role="presentation"
      onClick={() => {
        if (!busy) onCancel();
      }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 80,
        display: "grid",
        placeItems: "center",
        padding: 16,
        background: "rgba(0,0,0,0.72)",
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(100%, 420px)",
          background: "#111",
          border: "1px solid #333",
          color: "#fff",
          padding: 20,
          display: "grid",
          gap: 14,
        }}
      >
        <h2 id={titleId} style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>
          {title}
        </h2>
        <div style={{ margin: 0, fontSize: 14, lineHeight: 1.45, color: "#bbb" }}>
          {body}
        </div>
        <div
          style={{
            display: "flex",
            gap: 8,
            justifyContent: "flex-end",
            flexWrap: "wrap",
            marginTop: 4,
          }}
        >
          <button
            ref={cancelRef}
            type="button"
            disabled={busy}
            onClick={onCancel}
            style={adminBtn}
          >
            {t.common.cancel}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={onConfirm}
            style={{
              ...toneBtn[tone],
              opacity: busy ? 0.7 : 1,
              cursor: busy ? "wait" : "pointer",
            }}
          >
            {busy ? t.common.saving : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
