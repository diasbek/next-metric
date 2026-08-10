"use client";

import type { ReactNode } from "react";
import { HardNavForm } from "@/components/admin/HardNavForm";

import { useMemo, useState } from "react";
import { ImageField } from "@/components/admin/image-field";
import { deleteMediaAction, uploadMediaAction } from "@/app/admin/(dashboard)/media/actions";
import { adminBtn, adminInput } from "@/components/admin/ui/styles";
import { useAdminT } from "@/i18n/admin";

type Props = {
  files: Array<{ path: string; url: string }>;
  flash?: { uploaded?: boolean; error?: string };
  pager?: ReactNode;
};

export function MediaLibrary({ files, flash, pager }: Props) {
  const t = useAdminT();
  const [q, setQ] = useState("");
  const [folder, setFolder] = useState<string>("all");

  const folders = useMemo(() => {
    const set = new Set<string>();
    for (const file of files) {
      const parts = file.path.split("/");
      if (parts.length > 1) set.add(parts[0]);
      else set.add("(root)");
    }
    return Array.from(set).sort();
  }, [files]);

  const filtered = useMemo(() => {
    return files.filter((file) => {
      if (q.trim() && !file.path.toLowerCase().includes(q.trim().toLowerCase())) {
        return false;
      }
      if (folder === "all") return true;
      if (folder === "(root)") return !file.path.includes("/");
      return file.path.startsWith(`${folder}/`);
    });
  }, [files, q, folder]);

  return (
    <div>
      <h1 style={{ fontSize: 32, marginBottom: 8 }}>{t.media.title}</h1>
      <p style={{ color: "#888", marginBottom: 16 }}>
        {t.media.description}
      </p>
      {flash?.error ? <p style={{ color: "#f66" }}>{flash.error}</p> : null}
      {flash?.uploaded ? (
        <p style={{ color: "#6f6", marginBottom: 16 }}>{t.flash.uploaded}</p>
      ) : null}

      <HardNavForm
        action={uploadMediaAction}
        encType="multipart/form-data"
        style={{
          border: "1px solid #333",
          padding: 14,
          display: "grid",
          gap: 10,
          marginBottom: 24,
          width: "100%",
          maxWidth: 420,
        }}
      >
        <ImageField name="file" preset="free" label={t.common.uploadPhoto} required />
        <label style={{ fontSize: 13 }}>
          {t.common.folder}
          <input name="folder" placeholder={t.common.folderDefault} style={adminInput} />
        </label>
        <button type="submit" style={{ ...adminBtn, justifySelf: "start" }}>
          {t.media.upload}
        </button>
      </HardNavForm>

      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 16,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t.media.searchPlaceholder}
          style={{
            flex: "1 1 200px",
            padding: 10,
            background: "#111",
            border: "1px solid #333",
            color: "#fff",
          }}
        />
        <select
          value={folder}
          onChange={(e) => setFolder(e.target.value)}
          style={{
            padding: 10,
            background: "#111",
            border: "1px solid #333",
            color: "#fff",
          }}
        >
          <option value="all">{t.media.allFolders}</option>
          {folders.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
        <span style={{ fontSize: 12, color: "#777" }}>
          {filtered.length}/{files.length}
        </span>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
          gap: 12,
        }}
      >
        {filtered.map((file) => (
          <article
            key={file.path}
            style={{ border: "1px solid #333", padding: 8, display: "grid", gap: 8 }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={file.url}
              alt={file.path}
              loading="lazy"
              decoding="async"
              width={160}
              height={120}
              style={{ width: "100%", height: 120, objectFit: "cover" }}
            />
            <p style={{ fontSize: 11, color: "#888", wordBreak: "break-all", margin: 0 }}>
              {file.path}
            </p>
            <HardNavForm action={deleteMediaAction}>
              <input type="hidden" name="path" value={file.path} />
              <button
                type="submit"
                style={{ padding: 6, cursor: "pointer", color: "#f66", fontSize: 12 }}
              >
                {t.common.delete}
              </button>
            </HardNavForm>
          </article>
        ))}
      </div>
      {filtered.length === 0 ? <p style={{ color: "#888" }}>{t.common.emptyList}</p> : null}
      {pager}
    </div>
  );
}
