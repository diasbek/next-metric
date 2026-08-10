"use client";

import type { CSSProperties, ReactNode } from "react";
import { ADMIN_MD_BREAKPOINT } from "@/components/admin/chrome/nav";

type Props = {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
};

export function AdminPageHeader({ title, description, actions, children }: Props) {
  return (
    <div className="admin-page-header" style={{ marginBottom: 20 }}>
      <style>{`
        .admin-page-header__title {
          font-size: 22px;
          margin: 0;
          font-weight: 600;
          line-height: 1.2;
        }
        .admin-page-header__desc {
          color: #888;
          margin: 8px 0 0;
          font-size: 14px;
          line-height: 1.4;
          max-width: 52rem;
        }
        .admin-page-header__row {
          display: flex;
          flex-wrap: wrap;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
        }
        @media (min-width: ${ADMIN_MD_BREAKPOINT}px) {
          .admin-page-header__title {
            font-size: 28px;
          }
        }
      `}</style>
      <div className="admin-page-header__row">
        <div style={{ minWidth: 0, flex: "1 1 200px" }}>
          <h1 className="admin-page-header__title">{title}</h1>
          {description ? (
            <div className="admin-page-header__desc">{description}</div>
          ) : null}
        </div>
        {actions ? (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
              alignItems: "center",
              flexShrink: 0,
            }}
          >
            {actions}
          </div>
        ) : null}
      </div>
      {children}
    </div>
  );
}

export const adminSectionTabsStyle: CSSProperties = {
  display: "flex",
  gap: 8,
  flexWrap: "nowrap",
  overflowX: "auto",
  WebkitOverflowScrolling: "touch",
  marginBottom: 20,
  paddingBottom: 2,
  scrollbarWidth: "thin",
};
