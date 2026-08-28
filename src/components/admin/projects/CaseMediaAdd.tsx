"use client";

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type DragEvent,
} from "react";
import { flushSync } from "react-dom";
import Link from "next/link";
import { HardNavForm, runAdminMutation } from "@/components/admin/HardNavForm";
import { LibraryImagePicker } from "@/components/admin/form/LibraryImagePicker";
import { ImageField } from "@/components/admin/image-field";
import { PROJECT_CASE_MAX_UPLOAD_BYTES } from "@/components/admin/image-field/presets";
import {
  addProjectGalleryFrameAction,
  addProjectMediaAction,
  finishProjectGalleryBatchAction,
} from "@/app/admin/(dashboard)/works/actions";
import { adminBtn, adminBtnPrimary, adminInput } from "@/components/admin/ui/styles";
import type { AdminLocale } from "@/components/admin/ui/locales";
import { formatAdminMessage, useAdminT } from "@/i18n/admin";
import { isAdminFailure, isAdminSuccess } from "@/lib/cms/admin-redirect";
import type { LibraryItem } from "@/components/admin/projects/project-editor-types";

type MediaKind = "gallery" | "before" | "after";
type Mode = "upload" | "library";

type Props = {
  projectId: string;
  blockId: string;
  kind: MediaKind;
  library: LibraryItem[];
  locale: AdminLocale;
  /** URLs already in this gallery block — skip when queuing from library. */
  existingUrls?: string[];
  /** When replacing an existing before/after frame. */
  replacing?: boolean;
  previewTitle?: string;
  previewSubtitle?: string;
};

const segmentWrap: CSSProperties = {
  display: "flex",
  gap: 0,
  border: "1px solid #333",
  width: "fit-content",
  maxWidth: "100%",
  flexWrap: "wrap",
};

const segmentBtn = (active: boolean): CSSProperties => ({
  padding: "8px 12px",
  minHeight: 40,
  cursor: "pointer",
  border: "none",
  borderRight: "1px solid #333",
  background: active ? "#2600ff" : "#141414",
  color: active ? "#fff" : "#aaa",
  fontSize: 12,
  fontWeight: active ? 600 : 400,
});

function ReturnFields({
  locale,
  focus,
}: {
  locale: AdminLocale;
  focus?: string;
}) {
  return (
    <>
      <input type="hidden" name="return_locale" value={locale} />
      {focus ? <input type="hidden" name="return_focus" value={focus} /> : null}
    </>
  );
}

type QueuedFile = {
  id: string;
  source: "file";
  file: File;
  preview: string;
  label: string;
};

type QueuedLibrary = {
  id: string;
  source: "library";
  url: string;
  preview: string;
  label: string;
};

type QueuedFrame = QueuedFile | QueuedLibrary;

const MAX_BATCH = 40;

function revokeIfBlob(url: string) {
  if (url.startsWith("blob:")) URL.revokeObjectURL(url);
}

function GalleryBatchDrop({
  projectId,
  blockId,
  locale,
  library,
  existingUrls = [],
}: {
  projectId: string;
  blockId: string;
  locale: AdminLocale;
  library: LibraryItem[];
  existingUrls?: string[];
}) {
  const t = useAdminT();
  const inputRef = useRef<HTMLInputElement>(null);
  const libraryListId = useId();
  const [queue, setQueue] = useState<QueuedFrame[]>([]);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(0);
  const [batchTotal, setBatchTotal] = useState(0);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [libraryQuery, setLibraryQuery] = useState("");

  const queueRef = useRef(queue);
  queueRef.current = queue;

  const existingSet = useMemo(
    () => new Set(existingUrls.filter(Boolean)),
    [existingUrls],
  );
  const queuedLibraryUrls = useMemo(
    () =>
      new Set(
        queue
          .filter((item): item is QueuedLibrary => item.source === "library")
          .map((item) => item.url),
      ),
    [queue],
  );

  useEffect(() => {
    return () => {
      for (const item of queueRef.current) {
        if (item.source === "file") revokeIfBlob(item.preview);
      }
    };
  }, []);

  const roomLeft = () => Math.max(0, MAX_BATCH - queueRef.current.length);

  const enqueueFiles = (list: FileList | File[]) => {
    if (busy) return;
    const incoming = Array.from(list)
      .filter((file) => file.type.startsWith("image/"))
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
    if (incoming.length === 0) {
      setError(t.media.chooseImage);
      setNotice("");
      return;
    }

    const maxMb = Math.round(PROJECT_CASE_MAX_UPLOAD_BYTES / (1024 * 1024));
    const room = roomLeft();
    if (room === 0) {
      setError(
        formatAdminMessage(t.pages.project.galleryQueueFull, { max: MAX_BATCH }),
      );
      setNotice("");
      return;
    }

    const next: QueuedFile[] = [];
    let tooLarge = 0;
    let truncated = incoming.length > room;
    for (const file of incoming.slice(0, room)) {
      if (file.size > PROJECT_CASE_MAX_UPLOAD_BYTES) {
        tooLarge += 1;
        continue;
      }
      next.push({
        id: `file-${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2, 7)}`,
        source: "file",
        file,
        preview: URL.createObjectURL(file),
        label: file.name,
      });
    }

    const notes: string[] = [];
    if (tooLarge) {
      notes.push(
        formatAdminMessage(t.pages.project.gallerySkippedLarge, {
          count: tooLarge,
          max: maxMb,
        }),
      );
    }
    if (truncated || (incoming.length > room && next.length)) {
      notes.push(
        formatAdminMessage(t.pages.project.galleryQueueCapped, {
          max: MAX_BATCH,
        }),
      );
    }
    if (next.length === 0 && tooLarge) {
      setError(
        formatAdminMessage(t.media.fileTooLarge, { max: String(maxMb) }),
      );
      setNotice("");
      return;
    }
    setError("");
    setNotice(notes.join(" "));
    if (next.length) setQueue((prev) => [...prev, ...next]);
  };

  const toggleLibraryItem = (item: LibraryItem) => {
    if (busy) return;
    if (existingSet.has(item.url)) {
      setNotice(t.pages.project.galleryAlreadyInBlock);
      return;
    }
    const already = queuedLibraryUrls.has(item.url);
    if (already) {
      setQueue((prev) => prev.filter((frame) => !(frame.source === "library" && frame.url === item.url)));
      setError("");
      setNotice("");
      return;
    }
    if (roomLeft() === 0) {
      setError(
        formatAdminMessage(t.pages.project.galleryQueueFull, { max: MAX_BATCH }),
      );
      return;
    }
    const label = item.path.split("/").pop() || item.path;
    setQueue((prev) => [
      ...prev,
      {
        id: `lib-${item.path}`,
        source: "library",
        url: item.url,
        preview: item.url,
        label,
      },
    ]);
    setError("");
    setNotice("");
  };

  const removeQueued = (id: string) => {
    if (busy) return;
    setQueue((prev) => {
      const item = prev.find((frame) => frame.id === id);
      if (item?.source === "file") revokeIfBlob(item.preview);
      return prev.filter((frame) => frame.id !== id);
    });
  };

  const clearQueue = () => {
    if (busy) return;
    setQueue((prev) => {
      for (const item of prev) {
        if (item.source === "file") revokeIfBlob(item.preview);
      }
      return [];
    });
    setError("");
    setNotice("");
  };

  const onDrop = (event: DragEvent) => {
    event.preventDefault();
    setDragging(false);
    if (busy) return;
    enqueueFiles(event.dataTransfer.files);
  };

  const uploadQueue = async () => {
    if (!queue.length || busy) return;
    setBusy(true);
    setError("");
    setNotice("");
    setDone(0);
    setBatchTotal(queue.length);
    let added = 0;
    let skipped = 0;
    let failed = false;
    const snapshot = [...queue];
    try {
      for (const item of snapshot) {
        const fd = new FormData();
        fd.set("project_id", projectId);
        fd.set("block_id", blockId);
        if (item.source === "file") {
          fd.set("file", item.file);
        } else {
          fd.set("library_url", item.url);
        }
        let result;
        try {
          result = await addProjectGalleryFrameAction(fd);
        } catch (err) {
          setError(
            err instanceof Error && err.message.trim()
              ? err.message
              : t.common.actionFailed,
          );
          failed = true;
          break;
        }
        if (isAdminFailure(result)) {
          setError(result.error);
          failed = true;
          break;
        }
        if (isAdminSuccess(result) && result.message === "skipped") {
          skipped += 1;
        } else {
          added += 1;
        }
        setDone(added + skipped);
        if (item.source === "file") revokeIfBlob(item.preview);
        setQueue((prev) => prev.filter((frame) => frame.id !== item.id));
      }
      if (added > 0) {
        const fd = new FormData();
        fd.set("project_id", projectId);
        fd.set("added_count", String(added));
        fd.set("return_locale", locale);
        fd.set("return_focus", "gallery");
        await runAdminMutation(finishProjectGalleryBatchAction, fd, {
          fallbackError: t.common.actionFailed,
          defaultSaved: t.common.saved,
        });
      } else if (skipped > 0 && !failed) {
        setNotice(
          formatAdminMessage(t.pages.project.gallerySkippedDupes, {
            count: skipped,
          }),
        );
      }
    } finally {
      setBusy(false);
    }
  };

  const filteredLibrary = useMemo(() => {
    const needle = libraryQuery.trim().toLowerCase();
    if (!needle) return library;
    return library.filter((item) => item.path.toLowerCase().includes(needle));
  }, [library, libraryQuery]);

  return (
    <div style={{ display: "grid", gap: 10 }}>
      <div
        role="button"
        tabIndex={0}
        onClick={() => {
          if (!busy) inputRef.current?.click();
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            if (!busy) inputRef.current?.click();
          }
        }}
        onDragOver={(event) => {
          event.preventDefault();
          if (!busy) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        style={{
          display: "grid",
          placeItems: "center",
          gap: 6,
          minHeight: 140,
          padding: "28px 16px",
          boxSizing: "border-box",
          border: dragging ? "1px dashed #fff" : "1px dashed #444",
          background: dragging ? "#141414" : "#0c0c0c",
          cursor: busy ? "wait" : "pointer",
          textAlign: "center",
          opacity: busy ? 0.7 : 1,
        }}
      >
        <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "#ddd" }}>
          {t.pages.project.galleryDropTitle}
        </p>
        <p style={{ margin: 0, fontSize: 13, color: "#888", maxWidth: 420 }}>
          {t.pages.project.galleryDropHint}
        </p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
        multiple
        hidden
        disabled={busy}
        onChange={(event) => {
          if (event.target.files) enqueueFiles(event.target.files);
          event.target.value = "";
        }}
      />

      <div
        style={{
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <button
          type="button"
          disabled={busy}
          aria-expanded={libraryOpen}
          onClick={() => setLibraryOpen((v) => !v)}
          style={{
            ...adminBtn,
            opacity: busy ? 0.55 : 1,
            cursor: busy ? "wait" : "pointer",
          }}
        >
          {libraryOpen
            ? t.pages.project.galleryHideLibrary
            : t.pages.project.galleryShowLibrary}
        </button>
        {queue.length ? (
          <button
            type="button"
            disabled={busy}
            onClick={clearQueue}
            style={{
              ...adminBtn,
              opacity: busy ? 0.55 : 1,
              cursor: busy ? "wait" : "pointer",
            }}
          >
            {t.pages.project.galleryClearQueue}
          </button>
        ) : null}
      </div>

      {libraryOpen ? (
        <div
          style={{
            display: "grid",
            gap: 8,
            border: "1px solid #2a2a2a",
            padding: 12,
            background: "#0a0a0a",
          }}
        >
          <p style={{ margin: 0, fontSize: 13, color: "#aaa" }}>
            {t.pages.project.galleryLibraryHint}
          </p>
          {library.length === 0 ? (
            <p style={{ margin: 0, fontSize: 13, color: "#888" }}>
              {t.pages.project.libraryEmpty}{" "}
              <Link href="/admin/media/" style={{ color: "#8af" }}>
                {t.pages.project.openMediaLibrary}
              </Link>
            </p>
          ) : (
            <>
              <input
                value={libraryQuery}
                onChange={(e) => setLibraryQuery(e.target.value)}
                placeholder={t.media.searchPlaceholder}
                disabled={busy}
                style={{ ...adminInput, margin: 0 }}
                aria-controls={libraryListId}
              />
              <div
                id={libraryListId}
                role="listbox"
                aria-multiselectable
                aria-label={t.pages.project.fromLibrary}
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(88px, 1fr))",
                  gap: 8,
                  maxHeight: 280,
                  overflowY: "auto",
                }}
              >
                {filteredLibrary.map((item) => {
                  const inGallery = existingSet.has(item.url);
                  const selected = queuedLibraryUrls.has(item.url);
                  const disabled = busy || (inGallery && !selected);
                  return (
                    <button
                      key={item.path}
                      type="button"
                      role="option"
                      aria-selected={selected}
                      disabled={disabled}
                      title={
                        inGallery
                          ? t.pages.project.galleryAlreadyInBlock
                          : item.path
                      }
                      onClick={() => toggleLibraryItem(item)}
                      style={{
                        display: "grid",
                        gap: 4,
                        padding: 0,
                        margin: 0,
                        border: `1px solid ${selected ? "#2600ff" : inGallery ? "#333" : "#333"}`,
                        boxShadow: selected ? "0 0 0 1px #2600ff" : undefined,
                        background: "#111",
                        cursor: disabled ? "not-allowed" : "pointer",
                        opacity: inGallery ? 0.45 : 1,
                        textAlign: "left",
                        color: "#aaa",
                        width: "100%",
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
                        {selected ? "✓ " : ""}
                        {item.path.split("/").pop() || item.path}
                      </span>
                    </button>
                  );
                })}
              </div>
              {filteredLibrary.length === 0 ? (
                <p style={{ margin: 0, fontSize: 12, color: "#666" }}>
                  {t.common.emptyList}
                </p>
              ) : null}
            </>
          )}
        </div>
      ) : null}

      {queue.length ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(88px, 1fr))",
            gap: 8,
          }}
        >
          {queue.map((item) => (
            <div
              key={item.id}
              style={{
                position: "relative",
                border: "1px solid #333",
                background: "#111",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.preview}
                alt=""
                style={{
                  width: "100%",
                  height: 88,
                  objectFit: "contain",
                  display: "block",
                  background: "#111",
                }}
              />
              <span
                style={{
                  display: "block",
                  fontSize: 10,
                  color: "#888",
                  padding: "2px 4px 4px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {item.source === "library" ? "Library · " : ""}
                {item.label}
              </span>
              <button
                type="button"
                disabled={busy}
                aria-label={t.pages.project.galleryRemoveQueued}
                onClick={() => removeQueued(item.id)}
                style={{
                  position: "absolute",
                  top: 4,
                  right: 4,
                  width: 24,
                  height: 24,
                  padding: 0,
                  border: "1px solid #633",
                  background: "rgba(20,20,20,0.9)",
                  color: "#f66",
                  cursor: busy ? "wait" : "pointer",
                  fontSize: 14,
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      ) : null}

      <button
        type="button"
        disabled={!queue.length || busy}
        onClick={() => void uploadQueue()}
        style={{
          ...(queue.length && !busy ? adminBtnPrimary : adminBtn),
          opacity: queue.length && !busy ? 1 : 0.45,
          cursor: queue.length && !busy ? "pointer" : "not-allowed",
        }}
      >
        {busy
          ? formatAdminMessage(t.pages.project.galleryUploading, {
              done,
              total: batchTotal,
            })
          : formatAdminMessage(t.pages.project.galleryAddCount, {
              count: queue.length,
            })}
      </button>
      {notice ? (
        <p style={{ margin: 0, color: "#da6", fontSize: 13 }}>{notice}</p>
      ) : null}
      {error ? (
        <p style={{ margin: 0, color: "#f66", fontSize: 13 }}>{error}</p>
      ) : null}
    </div>
  );
}

export function CaseMediaAdd({
  projectId,
  blockId,
  kind,
  library,
  locale,
  existingUrls,
  replacing = false,
  previewTitle,
  previewSubtitle,
}: Props) {
  const t = useAdminT();
  const hasLibrary = library.length > 0;
  const [mode, setMode] = useState<Mode>("upload");
  const [fileReady, setFileReady] = useState(false);
  const [libraryUrl, setLibraryUrl] = useState("");
  const [librarySubmitting, setLibrarySubmitting] = useState(false);
  const libraryFormRef = useRef<HTMLFormElement>(null);

  const submitLabel = replacing
    ? t.pages.project.replaceImage
    : t.pages.project.addMedia;

  const fieldLabel = replacing
    ? t.pages.project.replaceImage
    : t.pages.project.addMedia;

  const resetModes = () => {
    setFileReady(false);
    setLibraryUrl("");
    setLibrarySubmitting(false);
  };

  return (
    <div style={{ display: "grid", gap: 10 }}>
      {kind === "gallery" && !replacing ? (
        <GalleryBatchDrop
          projectId={projectId}
          blockId={blockId}
          locale={locale}
          library={library}
          existingUrls={existingUrls}
        />
      ) : (
        <>
          {hasLibrary ? (
            <div role="tablist" aria-label={t.pages.project.addMedia} style={segmentWrap}>
              <button
                type="button"
                role="tab"
                aria-selected={mode === "upload"}
                onClick={() => {
                  setMode("upload");
                  resetModes();
                }}
                style={{
                  ...segmentBtn(mode === "upload"),
                  borderRight: "1px solid #333",
                }}
              >
                {t.pages.project.addFromUpload}
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={mode === "library"}
                onClick={() => {
                  setMode("library");
                  resetModes();
                }}
                style={{
                  ...segmentBtn(mode === "library"),
                  borderRight: "none",
                }}
              >
                {t.pages.project.addFromLibrary}
              </button>
            </div>
          ) : null}

          {mode === "upload" || !hasLibrary ? (
            <HardNavForm
              action={addProjectMediaAction}
              encType="multipart/form-data"
              style={{ display: "grid", gap: 8 }}
            >
              <input type="hidden" name="project_id" value={projectId} />
              <input type="hidden" name="block_id" value={blockId} />
              <input type="hidden" name="kind" value={kind} />
              <ReturnFields locale={locale} focus="gallery" />
              <ImageField
                name="file"
                preset="projectCase"
                label={fieldLabel}
                crop={false}
                previewTitle={previewTitle}
                previewSubtitle={previewSubtitle}
                onReady={(file) => setFileReady(!!file)}
              />
              <button
                type="submit"
                disabled={!fileReady}
                style={{
                  ...(fileReady ? adminBtnPrimary : adminBtn),
                  opacity: fileReady ? 1 : 0.45,
                  cursor: fileReady ? "pointer" : "not-allowed",
                }}
              >
                {submitLabel}
              </button>
            </HardNavForm>
          ) : (
            <HardNavForm
              ref={libraryFormRef}
              action={async (formData) => {
                try {
                  return await addProjectMediaAction(formData);
                } finally {
                  setLibrarySubmitting(false);
                }
              }}
              style={{
                display: "grid",
                gap: 8,
                opacity: librarySubmitting ? 0.6 : 1,
                pointerEvents: librarySubmitting ? "none" : undefined,
              }}
            >
              <input type="hidden" name="project_id" value={projectId} />
              <input type="hidden" name="block_id" value={blockId} />
              <input type="hidden" name="kind" value={kind} />
              <input type="hidden" name="library_url" value={libraryUrl} />
              <ReturnFields locale={locale} focus="gallery" />
              <LibraryImagePicker
                name="_library_pick"
                items={library}
                label={t.pages.project.fromLibrary}
                noneLabel={t.pages.project.noneOption}
                hint={t.pages.project.libraryClickToAdd}
                showClear={false}
                onSelect={(url) => {
                  if (!url || librarySubmitting) return;
                  flushSync(() => {
                    setLibraryUrl(url);
                    setLibrarySubmitting(true);
                  });
                  libraryFormRef.current?.requestSubmit();
                }}
              />
            </HardNavForm>
          )}
        </>
      )}
    </div>
  );
}
