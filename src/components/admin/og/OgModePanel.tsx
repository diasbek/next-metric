"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { adminBtn, adminBtnPrimary } from "@/components/admin/ui/styles";
import { useAdminT } from "@/i18n/admin";
import { isGeneratedOgUrl } from "@/utils/og/paths";

export type OgMode = "custom" | "generate" | "auto";

export function inferOgMode(ogImageUrl: string): OgMode {
  const url = ogImageUrl.trim();
  if (!url) return "auto";
  if (isGeneratedOgUrl(url)) return "generate";
  return "custom";
}

type PreviewFn = () => Promise<{ ok: true; dataUrl: string } | { ok: false; error: string }>;
type GenerateFn = () => Promise<
  { ok: true; ogImageUrl: string } | { ok: false; error: string }
>;
type ClearFn = () => Promise<{ ok: true } | { ok: false; error: string }>;

type Props = {
  mode: OgMode;
  onModeChange: (mode: OgMode) => void;
  /** Stored OG URL (custom or generated). Empty = auto. */
  ogImageUrl: string;
  onOgImageUrlChange: (url: string) => void;
  /** Live generate preview (data URL) for sidebar / panel. */
  previewDataUrl: string | null;
  onPreviewDataUrlChange: (url: string | null) => void;
  /** Debounced when mode=generate; deps should change when copy/cover changes. */
  previewKey: string;
  runPreview: PreviewFn;
  runGenerate: GenerateFn;
  runClear: ClearFn;
  /** Dynamic /og path for Auto mode link */
  dynamicOgPath: string | null;
  dynamicDisabledReason?: string | null;
  customSlot: ReactNode;
};

export function OgModePanel({
  mode,
  onModeChange,
  ogImageUrl,
  onOgImageUrlChange,
  previewDataUrl,
  onPreviewDataUrlChange,
  previewKey,
  runPreview,
  runGenerate,
  runClear,
  dynamicOgPath,
  dynamicDisabledReason,
  customSlot,
}: Props) {
  const t = useAdminT();
  const [busy, setBusy] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const previewSeq = useRef(0);

  useEffect(() => {
    if (mode !== "generate") return;
    const seq = ++previewSeq.current;
    const timer = window.setTimeout(() => {
      setPreviewLoading(true);
      setError(null);
      void runPreview().then((result) => {
        if (seq !== previewSeq.current) return;
        setPreviewLoading(false);
        if (result.ok) {
          onPreviewDataUrlChange(result.dataUrl);
        } else {
          setError(result.error || t.og.previewError);
          onPreviewDataUrlChange(null);
        }
      });
    }, 400);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, previewKey]);

  const switchMode = async (next: OgMode) => {
    setError(null);
    if (next === mode) return;
    if (next === "auto") {
      setBusy(true);
      const result = await runClear();
      setBusy(false);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      onOgImageUrlChange("");
      onPreviewDataUrlChange(null);
      onModeChange("auto");
      return;
    }
    if (next === "generate") {
      onModeChange("generate");
      return;
    }
    onModeChange("custom");
  };

  const onGenerate = async () => {
    setBusy(true);
    setError(null);
    const result = await runGenerate();
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    onOgImageUrlChange(result.ogImageUrl);
    onPreviewDataUrlChange(null);
    onModeChange("generate");
  };

  const modes: Array<{ id: OgMode; label: string }> = [
    { id: "custom", label: t.og.modeCustom },
    { id: "generate", label: t.og.modeGenerate },
    { id: "auto", label: t.og.modeAuto },
  ];

  const sourceLabel =
    mode === "auto"
      ? t.og.sourceAuto
      : mode === "generate" || isGeneratedOgUrl(ogImageUrl)
        ? t.og.sourceGenerated
        : t.og.sourceCustom;

  const panelPreview =
    mode === "generate"
      ? previewDataUrl || (isGeneratedOgUrl(ogImageUrl) ? ogImageUrl : null)
      : mode === "custom"
        ? ogImageUrl || null
        : null;

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
        {modes.map((item) => (
          <button
            key={item.id}
            type="button"
            disabled={busy}
            onClick={() => void switchMode(item.id)}
            style={{
              ...adminBtn,
              padding: "6px 10px",
              fontSize: 12,
              background: mode === item.id ? "#fff" : "#1a1a1a",
              color: mode === item.id ? "#000" : "#fff",
            }}
          >
            {item.label}
          </button>
        ))}
        <span style={{ fontSize: 11, color: "#888", marginLeft: 4 }}>{sourceLabel}</span>
      </div>
      <p style={{ margin: 0, fontSize: 11, color: "#777" }}>{t.og.dimensionsHint}</p>

      {mode === "custom" ? customSlot : null}

      {mode === "generate" ? (
        <div style={{ display: "grid", gap: 10 }}>
          <p style={{ margin: 0, fontSize: 12, color: "#aaa", lineHeight: 1.4 }}>
            {t.og.generateHint}
          </p>
          <div
            style={{
              position: "relative",
              width: "100%",
              aspectRatio: "1200 / 630",
              border: "1px solid #333",
              background: "#111",
              borderRadius: 8,
              overflow: "hidden",
            }}
          >
            {panelPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={panelPreview}
                alt=""
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
            ) : (
              <div
                style={{
                  display: "grid",
                  placeItems: "center",
                  height: "100%",
                  color: "#666",
                  fontSize: 12,
                  padding: 12,
                  textAlign: "center",
                }}
              >
                {previewLoading ? t.og.previewLoading : t.pages.project.ogPreviewEmpty}
              </div>
            )}
          </div>
          <button
            type="button"
            disabled={busy || previewLoading}
            onClick={() => void onGenerate()}
            style={{ ...adminBtnPrimary, justifySelf: "start" }}
          >
            {busy
              ? t.og.generating
              : isGeneratedOgUrl(ogImageUrl)
                ? t.og.regenerate
                : t.og.generate}
          </button>
        </div>
      ) : null}

      {mode === "auto" ? (
        <div style={{ display: "grid", gap: 8 }}>
          <p style={{ margin: 0, fontSize: 12, color: "#aaa", lineHeight: 1.4 }}>
            {t.og.autoHint}
          </p>
          {dynamicDisabledReason ? (
            <p style={{ margin: 0, fontSize: 12, color: "#c9a227" }}>{dynamicDisabledReason}</p>
          ) : null}
          {dynamicOgPath && !dynamicDisabledReason ? (
            <a
              href={dynamicOgPath}
              target="_blank"
              rel="noreferrer"
              style={{ fontSize: 12, color: "#8cf", justifySelf: "start" }}
            >
              {t.og.openDynamic} → {dynamicOgPath}
            </a>
          ) : null}
        </div>
      ) : null}

      {error ? (
        <p style={{ margin: 0, fontSize: 12, color: "#f66" }}>{error}</p>
      ) : null}
    </div>
  );
}
