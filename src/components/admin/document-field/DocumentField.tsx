"use client";

import {
  useId,
  useMemo,
  useState,
  type CSSProperties,
  type ChangeEvent,
} from "react";
import {
  formatFileSize,
  getLeadFileKind,
  LeadFileTypeIcon,
} from "@/components/molecules/LeadFileTypeIcon";
import { adminBtn, adminInput } from "@/components/admin/ui/styles";
import { formatAdminMessage, useAdminT } from "@/i18n/admin";

type Props = {
  /** Hidden URL field name submitted with the form. */
  urlName: string;
  /** File input name for new upload. */
  fileName: string;
  label: string;
  currentUrl?: string;
  hint?: string;
  accept?: string;
  /** Keep parent draft in sync when URL is edited or cleared. */
  onUrlChange?: (url: string) => void;
};

const wrap: CSSProperties = {
  border: "1px solid #333",
  padding: 14,
  display: "grid",
  gap: 12,
  background: "#0c0c0c",
};

function fileLabelFromUrl(url: string): string {
  try {
    const path = new URL(url, "https://example.com").pathname;
    const part = path.split("/").pop() || url;
    return decodeURIComponent(part);
  } catch {
    return url.split("/").pop() || url;
  }
}

export function DocumentField({
  urlName,
  fileName,
  label,
  currentUrl = "",
  hint,
  accept = ".pdf,.doc,.docx,.odt,.rtf,.ppt,.pptx,.txt,application/pdf",
  onUrlChange,
}: Props) {
  const t = useAdminT();
  const resolvedHint = hint ?? t.common.fileHint;
  const inputId = useId();
  const [url, setUrl] = useState(currentUrl);
  const [urlSource, setUrlSource] = useState(currentUrl);
  const [pending, setPending] = useState<File | null>(null);

  if (currentUrl !== urlSource) {
    setUrlSource(currentUrl);
    setUrl(currentUrl);
  }

  const setUrlSynced = (next: string) => {
    setUrl(next);
    onUrlChange?.(next);
  };

  const kind = useMemo(() => {
    if (pending) return getLeadFileKind(pending);
    if (!url) return "file" as const;
    const fake = new File([], fileLabelFromUrl(url), {
      type: url.toLowerCase().endsWith(".pdf")
        ? "application/pdf"
        : url.toLowerCase().match(/\.docx?$/)
          ? "application/msword"
          : "application/octet-stream",
    });
    return getLeadFileKind(fake);
  }, [pending, url]);

  const onPick = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setPending(file);
  };

  const clearPending = () => {
    setPending(null);
    const input = document.getElementById(inputId) as HTMLInputElement | null;
    if (input) input.value = "";
  };

  const clearCurrent = () => {
    setUrlSynced("");
    clearPending();
  };

  return (
    <div style={wrap}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          alignItems: "baseline",
        }}
      >
        <p style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>{label}</p>
        <p style={{ margin: 0, fontSize: 11, color: "#777" }}>{resolvedHint}</p>
      </div>

      <input type="hidden" name={urlName} value={url} readOnly />

      {pending || url ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "40px minmax(0, 1fr) auto",
            gap: 12,
            alignItems: "center",
            border: "1px solid #333",
            padding: 10,
            background: "#111",
          }}
        >
          <LeadFileTypeIcon kind={kind} />
          <div style={{ minWidth: 0 }}>
            <p
              style={{
                margin: 0,
                fontSize: 13,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {pending ? pending.name : fileLabelFromUrl(url)}
            </p>
            <p style={{ margin: "4px 0 0", fontSize: 12, color: "#888" }}>
              {pending
                ? formatAdminMessage(t.common.newFilePending, {
                    size: formatFileSize(pending.size),
                  })
                : t.common.currentFile}
              {!pending && url ? (
                <>
                  {" · "}
                  <a
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: "#8cf" }}
                  >
                    {t.common.openAttachment} ↗
                  </a>
                </>
              ) : null}
            </p>
          </div>
          <button
            type="button"
            style={adminBtn}
            onClick={() => (pending ? clearPending() : clearCurrent())}
          >
            {pending ? t.common.cancel : t.common.delete}
          </button>
        </div>
      ) : (
        <p style={{ margin: 0, fontSize: 13, color: "#666" }}>{t.common.noFileSelected}</p>
      )}

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <label htmlFor={inputId} style={{ ...adminBtn, display: "inline-block" }}>
          {pending || url ? t.common.replaceFile : t.common.uploadFile}
          <input
            id={inputId}
            type="file"
            name={fileName}
            accept={accept}
            onChange={onPick}
            style={{ display: "none" }}
          />
        </label>
        <input
          type="text"
          value={url}
          onChange={(e) => {
            setPending(null);
            setUrlSynced(e.target.value);
          }}
          placeholder={t.common.orPasteUrl}
          style={{ ...adminInput, marginTop: 0, flex: "1 1 220px" }}
          aria-label={`${label} URL`}
        />
      </div>
    </div>
  );
}
