"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AdminDesktopSidebar } from "@/components/admin/chrome/AdminDesktopSidebar";
import { AdminMobileTabBar } from "@/components/admin/chrome/AdminMobileTabBar";
import { AdminTopBar, ADMIN_TOPBAR_HEIGHT } from "@/components/admin/chrome/AdminTopBar";
import {
  ADMIN_MD_BREAKPOINT,
  type AdminNavItem,
} from "@/components/admin/chrome/nav";
import type { AdminRole } from "@/lib/cms/auth";

type Props = {
  items: AdminNavItem[];
  email: string;
  role: AdminRole | string;
  displayName: string;
  jobTitle: string;
  avatarUrl: string;
  showNotifications?: boolean;
  children: ReactNode;
};

export function AdminChrome({
  items,
  email,
  role,
  displayName,
  jobTitle,
  avatarUrl,
  showNotifications = false,
  children,
}: Props) {
  const pathname = usePathname() || "/admin/";
  const profile = { email, role, displayName, jobTitle, avatarUrl };

  return (
    <div className="admin-chrome">
      <style>{`
        .admin-chrome {
          --admin-top: ${ADMIN_TOPBAR_HEIGHT}px;
          --admin-tabbar: calc(72px + env(safe-area-inset-bottom, 0px));
          --admin-sidebar: 240px;
          min-height: 100svh;
          display: flex;
          flex-direction: column;
          background: #0a0a0a;
          color: #fafafa;
        }
        .admin-chrome__body {
          display: flex;
          align-items: stretch;
          flex: 1 1 auto;
          min-height: 0;
          padding-top: var(--admin-top);
        }
        .admin-chrome__sidebar {
          display: none;
          flex-shrink: 0;
          align-self: stretch;
        }
        .admin-chrome__tabbar {
          display: contents;
        }
        .admin-chrome__main {
          flex: 1 1 auto;
          min-width: 0;
          width: 100%;
          padding: 20px 16px calc(var(--admin-tabbar) + 16px);
        }
        .admin-chrome button,
        .admin-chrome [role="button"],
        .admin-chrome input[type="submit"],
        .admin-chrome a.admin-nav-link {
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
        }
        .admin-chrome button:active:not(:disabled),
        .admin-chrome [role="button"]:active,
        .admin-chrome input[type="submit"]:active:not(:disabled) {
          filter: brightness(1.2);
        }
        .admin-chrome form:has([data-admin-form-pending]) {
          opacity: 0.72;
          cursor: wait;
        }
        .admin-chrome form:has([data-admin-form-pending]) button,
        .admin-chrome form:has([data-admin-form-pending]) input,
        .admin-chrome form:has([data-admin-form-pending]) select,
        .admin-chrome form:has([data-admin-form-pending]) textarea {
          cursor: wait;
          pointer-events: none;
        }
        /* Sidebar / sheet nav — route active only, no leftover focus boxes. */
        .admin-nav-link {
          color: #cfcfcf;
          text-decoration: none;
          padding: 10px 12px;
          border-radius: 0;
          font-size: 13px;
          line-height: 1.25;
          display: flex;
          align-items: center;
          gap: 10px;
          border: none;
          background: transparent;
          box-shadow: none;
          box-sizing: border-box;
          font-weight: 400;
          outline: none;
          -webkit-tap-highlight-color: transparent;
        }
        .admin-nav-link:hover {
          background: #111;
          color: #fff;
        }
        .admin-nav-link.is-active {
          background: #141414;
          color: #fff;
          font-weight: 600;
          box-shadow: inset 2px 0 0 #fff;
        }
        .admin-nav-link.is-active:hover {
          background: #141414;
          color: #fff;
        }
        .admin-nav-link:focus,
        .admin-nav-link:focus-visible {
          outline: none;
        }
        .admin-nav-link:focus-visible:not(.is-active) {
          background: #111;
          box-shadow: inset 0 0 0 1px #444;
        }
        .admin-nav-link--muted {
          color: #aaa;
        }
        .admin-nav-link--sheet {
          padding: 12px 14px;
          font-size: 15px;
        }
        .admin-form-2col {
          display: grid;
          grid-template-columns: minmax(0, 1fr);
          gap: 10px;
        }
        .admin-preview-split {
          display: grid;
          grid-template-columns: minmax(0, 1fr);
          gap: 12px;
          width: 100%;
          min-width: 0;
        }
        .admin-preview-hero {
          display: grid;
          grid-template-columns: minmax(0, 1fr);
          gap: 16px;
          min-width: 0;
        }
        .admin-preview-stats {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px 12px;
          min-width: 0;
        }
        .admin-preview-stats > * {
          border-left: 0 !important;
          padding-left: 0 !important;
          min-width: 0;
        }
        .admin-preview-stat-row {
          display: grid;
          grid-template-columns: minmax(0, 1fr);
          gap: 8px;
          align-items: end;
        }
        .admin-surface-preview {
          width: 100%;
          max-width: 100%;
          min-width: 0;
          box-sizing: border-box;
          overflow: hidden;
        }
        .admin-surface-preview__title {
          font-size: clamp(22px, 6vw, 36px) !important;
          overflow-wrap: anywhere;
        }
        .admin-surface-preview__quote {
          font-size: clamp(16px, 4.5vw, 20px) !important;
          overflow-wrap: anywhere;
        }
        .admin-surface-preview__stat {
          font-size: clamp(28px, 8vw, 40px) !important;
        }
        .admin-image-field {
          width: 100%;
          max-width: 100%;
          min-width: 0;
          overflow: hidden;
        }
        .admin-image-field__drop {
          display: grid;
          place-items: center;
          gap: 6px;
          min-height: 88px;
          max-height: 112px;
          padding: 16px 12px;
          box-sizing: border-box;
          border: 1px dashed #444;
          background: #111;
          color: #888;
          text-align: center;
          cursor: pointer;
          width: 100%;
          max-width: 100%;
        }
        .admin-image-field__drop:hover,
        .admin-image-field__drop.is-dragging {
          border-color: #fff;
          color: #ccc;
          background: #141414;
        }
        .admin-image-field__drop-title {
          margin: 0;
          font-size: 13px;
          font-weight: 600;
          color: #ddd;
        }
        .admin-image-field__drop-hint {
          margin: 0;
          font-size: 12px;
          color: #777;
        }
        .admin-image-field__idle {
          width: 100%;
          max-width: 100%;
          min-width: 0;
        }
        .admin-image-field__idle--thumb .admin-surface-preview {
          max-width: min(100%, 200px);
        }
        .admin-image-field__idle--media .admin-surface-preview {
          max-width: min(100%, 280px);
        }
        .admin-image-field__idle--cover .admin-surface-preview {
          max-width: min(100%, 360px);
        }
        .admin-image-field__idle--cover .admin-preview-split {
          max-width: min(100%, 560px);
        }
        .admin-image-field__idle .admin-surface-preview {
          padding: 10px;
        }
        .admin-image-field__idle .admin-surface-preview > p:first-child {
          margin-bottom: 8px !important;
          font-size: 11px;
        }
        .admin-image-field__edit {
          display: grid;
          grid-template-columns: minmax(0, 1fr);
          gap: 14px;
          align-items: start;
          min-width: 0;
        }
        .admin-image-field__crop {
          width: 100%;
          max-width: 100%;
          min-width: 0;
        }
        .admin-team-cms .agency-team {
          margin-top: 0;
        }
        .admin-team-cms .agency-team__grid {
          margin-top: 16px;
          gap: 16px;
        }
        @media (min-width: ${ADMIN_MD_BREAKPOINT}px) {
          .admin-chrome__sidebar {
            display: flex;
          }
          .admin-chrome__tabbar {
            display: none !important;
          }
          .admin-chrome__main {
            padding: 28px 36px 48px;
          }
          .admin-form-2col {
            grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
            gap: 12px;
          }
          .admin-preview-split {
            grid-template-columns: minmax(0, 1.4fr) minmax(0, 0.7fr);
            gap: 12px;
          }
          .admin-preview-split--edit {
            grid-template-columns: minmax(0, 1.15fr) minmax(0, 0.85fr);
            gap: 14px;
          }
          .admin-preview-hero {
            grid-template-columns: minmax(0, 1.2fr) minmax(0, 0.9fr);
            gap: 24px;
          }
          .admin-preview-stats {
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 16px;
          }
          .admin-preview-stats > * + * {
            border-left: 1px solid rgba(255, 255, 255, 0.35) !important;
            padding-left: 16px !important;
          }
          .admin-preview-stat-row {
            grid-template-columns: 120px minmax(0, 1fr) auto;
          }
          .admin-image-field__edit--desktop {
            grid-template-columns: minmax(0, 1.15fr) minmax(0, 0.85fr);
          }
        }
      `}</style>

      <AdminTopBar {...profile} showNotifications={showNotifications} />

      <div className="admin-chrome__body">
        <div className="admin-chrome__sidebar">
          <AdminDesktopSidebar items={items} pathname={pathname} />
        </div>

        <main className="admin-chrome__main">{children}</main>
      </div>

      <div className="admin-chrome__tabbar">
        <AdminMobileTabBar items={items} pathname={pathname} />
      </div>
    </div>
  );
}
