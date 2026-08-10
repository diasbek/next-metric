"use client";

import type { ReactNode } from "react";

type FileKind = "pdf" | "word" | "txt" | "image" | "file";

export function getLeadFileKind(file: File): FileKind {
  const name = file.name.toLowerCase();
  const type = file.type;

  if (type === "application/pdf" || name.endsWith(".pdf")) return "pdf";
  if (
    type.includes("word") ||
    type.includes("msword") ||
    type.includes("opendocument.text") ||
    name.endsWith(".doc") ||
    name.endsWith(".docx") ||
    name.endsWith(".odt") ||
    name.endsWith(".rtf")
  ) {
    return "word";
  }
  if (type.startsWith("text/") || name.endsWith(".txt")) return "txt";
  if (type.startsWith("image/")) return "image";
  return "file";
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function Shell({
  className,
  children,
  fill,
}: {
  className?: string;
  children: ReactNode;
  fill: string;
}) {
  return (
    <svg
      className={className}
      width={40}
      height={48}
      viewBox="0 0 40 48"
      fill="none"
      aria-hidden
    >
      <path
        d="M8 2h16l12 12v30a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V6a4 4 0 0 1 4-4Z"
        fill={fill}
      />
      <path d="M24 2v10a2 2 0 0 0 2 2h10" fill="rgba(0,0,0,0.18)" />
      {children}
    </svg>
  );
}

export function LeadFileTypeIcon({
  kind,
  className,
}: {
  kind: FileKind;
  className?: string;
}) {
  if (kind === "pdf") {
    return (
      <Shell className={className} fill="#E53935">
        <text
          x="20"
          y="34"
          textAnchor="middle"
          fill="#fff"
          fontSize="11"
          fontWeight="700"
          fontFamily="system-ui, sans-serif"
        >
          PDF
        </text>
      </Shell>
    );
  }
  if (kind === "word") {
    return (
      <Shell className={className} fill="#2B579A">
        <text
          x="20"
          y="34"
          textAnchor="middle"
          fill="#fff"
          fontSize="10"
          fontWeight="700"
          fontFamily="system-ui, sans-serif"
        >
          DOC
        </text>
      </Shell>
    );
  }
  if (kind === "txt") {
    return (
      <Shell className={className} fill="#607D8B">
        <text
          x="20"
          y="34"
          textAnchor="middle"
          fill="#fff"
          fontSize="11"
          fontWeight="700"
          fontFamily="system-ui, sans-serif"
        >
          TXT
        </text>
      </Shell>
    );
  }
  if (kind === "image") {
    return (
      <Shell className={className} fill="#43A047">
        <path
          d="M10 30l5.5-7 4 5 3-3.5L30 30H10Z"
          fill="#fff"
          opacity="0.95"
        />
        <circle cx="14" cy="18" r="2.2" fill="#fff" />
      </Shell>
    );
  }
  return (
    <Shell className={className} fill="#9E9E9E">
      <text
        x="20"
        y="34"
        textAnchor="middle"
        fill="#fff"
        fontSize="10"
        fontWeight="700"
        fontFamily="system-ui, sans-serif"
      >
        FILE
      </text>
    </Shell>
  );
}

export type { FileKind };
