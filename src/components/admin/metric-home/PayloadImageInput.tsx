"use client";

import { useRef, useState, type CSSProperties } from "react";
import {
  formatUploadError,
  uploadMediaViaApi,
} from "@/lib/cms/browser-upload";
import { adminBtn, adminInput } from "@/components/admin/ui/styles";
import {
  adminToastError,
  adminToastSuccess,
} from "@/components/admin/toast/AdminToaster";
import { useAdminT } from "@/i18n/admin";

type Props = {
  label: string;
  value: string;
  folder?: string;
  onChange: (url: string) => void;
};

const previewWrap: CSSProperties = {
  width: 120,
  height: 90,
  border: "1px solid #333",
  background: "#111",
  overflow: "hidden",
  display: "grid",
  placeItems: "center",
};

export function PayloadImageInput({
  label,
  value,
  folder = "metric-home",
  onChange,
}: Props) {
  const t = useAdminT();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function onFile(file: File | null) {
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const uploaded = await uploadMediaViaApi(file, {
        folder,
        filenameHint: file.name.replace(/\.[^.]+$/, "") || "image",
      });
      onChange(uploaded.publicUrl);
      adminToastSuccess(t.flash.uploaded);
    } catch (err) {
      const message = formatUploadError(
        err instanceof Error ? err.message : t.common.actionFailed,
        t.common.uploadNetworkError,
      );
      setError(message);
      adminToastError(message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ display: "grid", gap: 8 }}>
      <span style={{ fontSize: 12, color: "#aaa" }}>{label}</span>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-start" }}>
        <div style={previewWrap}>
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={value}
              alt=""
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <span style={{ color: "#666", fontSize: 11 }}>No image</span>
          )}
        </div>
        <div style={{ flex: 1, minWidth: 220, display: "grid", gap: 8 }}>
          <input
            style={adminInput}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={t.common.orPasteUrl}
          />
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button
              type="button"
              style={adminBtn}
              disabled={busy}
              onClick={() => inputRef.current?.click()}
            >
              {busy ? t.common.saving : t.common.uploadPhoto}
            </button>
            {value ? (
              <button
                type="button"
                style={adminBtn}
                onClick={() => onChange("")}
              >
                {t.common.delete}
              </button>
            ) : null}
          </div>
          <p style={{ margin: 0, fontSize: 11, color: "#666" }}>
            {t.common.saveSectionToPublish}
          </p>
          {error ? (
            <p style={{ margin: 0, color: "#f88", fontSize: 12 }}>{error}</p>
          ) : null}
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0] ?? null;
          e.target.value = "";
          void onFile(file);
        }}
      />
    </div>
  );
}
