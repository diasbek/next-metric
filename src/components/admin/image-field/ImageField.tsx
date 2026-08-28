"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type DragEvent,
  type WheelEvent,
} from "react";
import type { Area } from "react-easy-crop";
import { EasyCropper } from "./EasyCropper";
import { cropAndCompress, formatBytes } from "./crop-image";
import { formatAdminMessage, useAdminT } from "@/i18n/admin";
import { useAdminDesktop } from "@/components/admin/ui/useAdminDesktop";
import { IMAGE_PRESETS, type ImagePresetKey } from "./presets";
import {
  ProjectCardPeek,
  SurfacePreview,
  surfaceAspectCss,
} from "./SurfacePreview";

type ImageFieldProps = {
  name: string;
  preset?: ImagePresetKey;
  currentUrl?: string | null;
  label?: string;
  required?: boolean;
  onReady?: (file: File | null) => void;
  /** Chrome text in site mockups */
  previewTitle?: string;
  previewSubtitle?: string;
  previewQuote?: string;
};

const shell: CSSProperties = {
  border: "1px solid #333",
  padding: 14,
  display: "grid",
  gap: 14,
  background: "#0a0a0a",
};

const btn: CSSProperties = {
  padding: "8px 12px",
  cursor: "pointer",
  background: "#1a1a1a",
  border: "1px solid #444",
  color: "#fff",
  fontSize: 13,
};

const btnPrimary: CSSProperties = {
  ...btn,
  background: "#2600ff",
  border: "1px solid #2600ff",
  fontWeight: 600,
};

const chip: CSSProperties = {
  border: "1px solid #333",
  padding: "4px 8px",
  fontSize: 11,
  color: "#aaa",
  background: "#111",
};

export function ImageField({
  name,
  preset = "free",
  currentUrl,
  label,
  required = false,
  onReady,
  previewTitle,
  previewSubtitle,
  previewQuote,
}: ImageFieldProps) {
  const t = useAdminT();
  const isDesktop = useAdminDesktop();
  const presetConfig = IMAGE_PRESETS[preset];
  const presetCopy = t.media.presets[preset];
  const inputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hiddenRef = useRef<HTMLInputElement>(null);

  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [sourceName, setSourceName] = useState("image");
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedArea, setCroppedArea] = useState<Area | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentUrl ?? null);
  const [meta, setMeta] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const [editing, setEditing] = useState(false);
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  /** On a real phone always stack; on desktop honour the viewport toggle. */
  const stackEditLayout = !isDesktop || device === "mobile";
  const [syncedUrl, setSyncedUrl] = useState(currentUrl ?? null);
  if ((currentUrl ?? null) !== syncedUrl) {
    setSyncedUrl(currentUrl ?? null);
    setPreviewUrl(currentUrl ?? null);
  }

  useEffect(() => {
    return () => {
      if (sourceUrl?.startsWith("blob:")) URL.revokeObjectURL(sourceUrl);
      if (previewUrl?.startsWith("blob:") && previewUrl !== sourceUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const assignFile = useCallback(
    (file: File | null) => {
      const input = hiddenRef.current;
      if (!input) return;
      const dt = new DataTransfer();
      if (file) dt.items.add(file);
      input.files = dt.files;
      onReady?.(file);
    },
    [onReady],
  );

  const openFile = (file: File | null | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError(t.media.chooseImage);
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      setError(t.media.fileTooLarge);
      return;
    }
    setError("");
    if (sourceUrl?.startsWith("blob:")) URL.revokeObjectURL(sourceUrl);
    const url = URL.createObjectURL(file);
    setSourceUrl(url);
    setSourceName(file.name);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setEditing(true);
    setMeta(formatAdminMessage(t.media.originalSize, { size: formatBytes(file.size) }));
  };

  const onDrop = (event: DragEvent) => {
    event.preventDefault();
    setDragging(false);
    openFile(event.dataTransfer.files?.[0]);
  };

  const onWheelZoom = (event: WheelEvent) => {
    if (!editing) return;
    event.preventDefault();
    const delta = event.deltaY > 0 ? -0.08 : 0.08;
    setZoom((z) => Math.min(3, Math.max(1, Number((z + delta).toFixed(2)))));
  };

  const applyCrop = async () => {
    if (!sourceUrl || !croppedArea) return;
    setBusy(true);
    setError("");
    try {
      const result = await cropAndCompress({
        imageSrc: sourceUrl,
        crop: croppedArea,
        preset: presetConfig,
        fileNameHint: sourceName,
        rotation,
      });
      if (previewUrl?.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(result.previewUrl);
      assignFile(result.file);
      setEditing(false);
      setMeta(
        `${result.width}×${result.height} · ${formatBytes(result.bytes)} · ${result.file.type}`,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : t.media.cropFailed);
    } finally {
      setBusy(false);
    }
  };

  const clear = () => {
    assignFile(null);
    if (previewUrl?.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    if (sourceUrl?.startsWith("blob:")) URL.revokeObjectURL(sourceUrl);
    setPreviewUrl(currentUrl ?? null);
    setSourceUrl(null);
    setEditing(false);
    setMeta("");
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const displayPreview = editing ? sourceUrl || previewUrl : previewUrl;
  const cropFrameAspect = surfaceAspectCss(presetConfig);
  const idleDensity =
    preset === "team" || preset === "avatar"
      ? "thumb"
      : preset === "projectCover" || preset === "projectCase"
        ? "cover"
        : "media";
  const openPicker = () => fileInputRef.current?.click();

  return (
    <div className="admin-image-field" style={shell}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 8,
          flexWrap: "wrap",
          alignItems: "baseline",
        }}
      >
        <div>
          <strong style={{ fontSize: 14 }}>{label ?? presetCopy.label}</strong>
          <p style={{ margin: "4px 0 0", fontSize: 12, color: "#888" }}>
            {presetCopy.hint}
          </p>
        </div>
        {editing ? (
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <span style={chip}>{t.media.dragToPan}</span>
            <span style={chip}>{t.media.wheelZoom}</span>
          </div>
        ) : null}
      </div>

      <input
        ref={hiddenRef}
        type="file"
        name={name}
        accept="image/jpeg,image/png,image/webp"
        required={required && !currentUrl && !previewUrl}
        style={{ display: "none" }}
        tabIndex={-1}
        onChange={() => {
          /* programmatic */
        }}
      />

      {!editing ? (
        <>
          <div
            className={`admin-image-field__idle admin-image-field__idle--${idleDensity}`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
          >
            {displayPreview ? (
              <div
                className={preset === "projectCover" ? "admin-preview-split" : undefined}
                style={
                  preset === "projectCover"
                    ? undefined
                    : { display: "grid", gridTemplateColumns: "1fr", gap: 12 }
                }
              >
                <div
                  style={{ cursor: "pointer" }}
                  onClick={openPicker}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") openPicker();
                  }}
                >
                  <SurfacePreview
                    surface={presetConfig.surface}
                    imageUrl={displayPreview}
                    title={previewTitle}
                    subtitle={previewSubtitle}
                    quote={previewQuote}
                  />
                </div>
                {preset === "projectCover" ? (
                  <ProjectCardPeek imageUrl={displayPreview} title={previewTitle} />
                ) : null}
              </div>
            ) : (
              <button
                type="button"
                className={`admin-image-field__drop${dragging ? " is-dragging" : ""}`}
                onClick={openPicker}
              >
                <p className="admin-image-field__drop-title">{label ?? presetCopy.label}</p>
                <p className="admin-image-field__drop-hint">{t.media.dropHint}</p>
              </button>
            )}
          </div>

          <input
            ref={fileInputRef}
            id={inputId}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
            style={{ display: "none" }}
            onChange={(e) => openFile(e.target.files?.[0])}
          />

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <button type="button" style={btnPrimary} onClick={openPicker}>
              {previewUrl ? t.media.replaceAndEdit : t.media.uploadAndEdit}
            </button>
            {previewUrl && currentUrl && previewUrl !== currentUrl ? (
              <button type="button" style={btn} onClick={clear}>
                {t.media.revert}
              </button>
            ) : null}
            {previewUrl && !currentUrl ? (
              <button type="button" style={btn} onClick={clear}>
                {t.media.clear}
              </button>
            ) : null}
            {meta ? <span style={{ fontSize: 12, color: "#6f6" }}>{meta}</span> : null}
          </div>
        </>
      ) : (
        <>
          {isDesktop ? (
            <div
              style={{
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              <span style={{ fontSize: 12, color: "#888" }}>{t.media.viewport}</span>
              {(["desktop", "mobile"] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  style={{
                    ...btn,
                    background: device === mode ? "#fff" : "#1a1a1a",
                    color: device === mode ? "#000" : "#fff",
                  }}
                  onClick={() => setDevice(mode)}
                >
                  {mode === "desktop" ? t.media.desktop : t.media.mobile}
                </button>
              ))}
            </div>
          ) : null}

          <div
            className={
              stackEditLayout
                ? "admin-image-field__edit"
                : "admin-image-field__edit admin-image-field__edit--desktop"
            }
          >
            {/* Interactive crop inside site-shaped frame */}
            <div className="admin-image-field__crop" style={{ display: "grid", gap: 10 }}>
              <p style={{ margin: 0, fontSize: 12, color: "#888" }}>
                {formatAdminMessage(t.media.editFrame, {
                  surface: presetCopy.surfaceLabel,
                })}
              </p>
              <div
                onWheel={onWheelZoom}
                style={{
                  position: "relative",
                  width: "100%",
                  maxWidth: stackEditLayout ? 360 : "100%",
                  aspectRatio: cropFrameAspect,
                  margin: stackEditLayout ? "0 auto" : undefined,
                  background: "#000",
                  border: "1px solid #2600ff",
                  boxShadow: "0 0 0 1px rgba(38,0,255,0.35)",
                  overflow: "hidden",
                  minHeight: stackEditLayout ? 200 : 280,
                  height: cropFrameAspect ? undefined : stackEditLayout ? 280 : 360,
                }}
              >
                {sourceUrl ? (
                  <EasyCropper
                    image={sourceUrl}
                    crop={crop}
                    zoom={zoom}
                    rotation={rotation}
                    {...(presetConfig.aspect != null
                      ? { aspect: presetConfig.aspect }
                      : {})}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onRotationChange={setRotation}
                    onCropComplete={(_, pixels) => {
                      setCroppedArea(pixels);
                    }}
                    showGrid
                    objectFit="contain"
                    style={{
                      containerStyle: { background: "#050505" },
                      cropAreaStyle: {
                        border: "1px solid rgba(255,255,255,0.85)",
                      },
                    }}
                  />
                ) : null}
              </div>

              <label style={{ fontSize: 12, color: "#ccc", display: "grid", gap: 6 }}>
                {t.media.zoom} {zoom.toFixed(2)}×
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.01}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                />
              </label>
              <label style={{ fontSize: 12, color: "#ccc", display: "grid", gap: 6 }}>
                {t.media.rotation} {Math.round(rotation)}°
                <input
                  type="range"
                  min={-45}
                  max={45}
                  step={1}
                  value={rotation}
                  onChange={(e) => {
                    setRotation(Number(e.target.value));
                  }}
                />
              </label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button
                  type="button"
                  style={btn}
                  onClick={() => {
                    setRotation((r) => r - 90);
                  }}
                >
                  ⟲ 90°
                </button>
                <button
                  type="button"
                  style={btn}
                  onClick={() => {
                    setRotation((r) => r + 90);
                  }}
                >
                  ⟳ 90°
                </button>
                <button
                  type="button"
                  style={btn}
                  onClick={() => {
                    setZoom(1);
                    setCrop({ x: 0, y: 0 });
                    setRotation(0);
                  }}
                >
                  {t.media.resetView}
                </button>
              </div>
            </div>

            {/* Live site mock */}
            <div style={{ display: "grid", gap: 10, minWidth: 0, maxWidth: "100%" }}>
              <p style={{ margin: 0, fontSize: 12, color: "#888" }}>
                {t.media.liveAsOnSite}
              </p>
              <SurfacePreview
                surface={presetConfig.surface}
                imageUrl={sourceUrl || previewUrl}
                title={previewTitle}
                subtitle={previewSubtitle}
                quote={previewQuote}
                interactive
              />
              {preset === "projectCover" ? (
                <ProjectCardPeek
                  imageUrl={sourceUrl || previewUrl}
                  title={previewTitle}
                />
              ) : null}
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button type="button" style={btnPrimary} disabled={busy} onClick={() => void applyCrop()}>
              {busy ? t.media.exporting : t.media.applyCrop}
            </button>
            <button
              type="button"
              style={btn}
              disabled={busy}
              onClick={() => {
                setEditing(false);
                if (sourceUrl?.startsWith("blob:")) URL.revokeObjectURL(sourceUrl);
                setSourceUrl(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
            >
              {t.common.cancel}
            </button>
          </div>
        </>
      )}

      {error ? <p style={{ color: "#f66", margin: 0, fontSize: 13 }}>{error}</p> : null}
    </div>
  );
}
