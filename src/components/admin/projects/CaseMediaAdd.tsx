"use client";

import { useRef, useState, type CSSProperties } from "react";
import { flushSync } from "react-dom";
import { HardNavForm } from "@/components/admin/HardNavForm";
import { LibraryImagePicker } from "@/components/admin/form/LibraryImagePicker";
import { ImageField } from "@/components/admin/image-field";
import { addProjectMediaAction } from "@/app/admin/(dashboard)/works/actions";
import { adminBtn, adminBtnPrimary } from "@/components/admin/ui/styles";
import type { AdminLocale } from "@/components/admin/ui/locales";
import { useAdminT } from "@/i18n/admin";
import type { LibraryItem } from "@/components/admin/projects/project-editor-types";

type MediaKind = "gallery" | "before" | "after";
type Mode = "upload" | "library";

type Props = {
  projectId: string;
  blockId: string;
  kind: MediaKind;
  library: LibraryItem[];
  locale: AdminLocale;
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

export function CaseMediaAdd({
  projectId,
  blockId,
  kind,
  library,
  locale,
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
              // Commit the hidden input before submitting the form with it.
              flushSync(() => {
                setLibraryUrl(url);
                setLibrarySubmitting(true);
              });
              libraryFormRef.current?.requestSubmit();
            }}
          />
        </HardNavForm>
      )}
    </div>
  );
}
