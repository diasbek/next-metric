"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { adminBtn } from "@/components/admin/ui/styles";
import {
  AdminPageHeader,
  adminSectionTabsStyle,
} from "@/components/admin/ui/AdminPageHeader";
import { useAdminT } from "@/i18n/admin";

export type PageSection = {
  id: string;
  label: string;
};

type Props = {
  title: string;
  publicPath: string;
  description?: string;
  sections: PageSection[];
  activeSection: string;
  children: ReactNode;
  basePath: string;
  extra?: ReactNode;
};

export function AdminPageShell({
  title,
  publicPath,
  description,
  sections,
  activeSection,
  children,
  basePath,
  extra,
}: Props) {
  const t = useAdminT();

  return (
    <div>
      <AdminPageHeader
        title={title}
        description={
          description ?? (
            <>
              {t.shell.contentOf}{" "}
              <a
                href={publicPath}
                target="_blank"
                rel="noreferrer"
                style={{ color: "#8cf" }}
              >
                {publicPath}
              </a>
            </>
          )
        }
        actions={
          <Link
            href={publicPath}
            target="_blank"
            style={{ ...adminBtn, textDecoration: "none" }}
          >
            {t.chrome.openSite}
          </Link>
        }
      />

      {sections.length > 1 ? (
        <div style={adminSectionTabsStyle}>
          {sections.map((section) => {
            const active = section.id === activeSection;
            const href = `${basePath}?section=${encodeURIComponent(section.id)}`;
            return (
              <Link
                key={section.id}
                href={href}
                style={{
                  ...adminBtn,
                  background: active ? "#fff" : "#1a1a1a",
                  color: active ? "#000" : "#fff",
                  fontWeight: active ? 600 : 400,
                  textDecoration: "none",
                  flexShrink: 0,
                  whiteSpace: "nowrap",
                }}
              >
                {section.label}
              </Link>
            );
          })}
        </div>
      ) : null}

      {extra}
      {children}
    </div>
  );
}
