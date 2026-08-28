"use client";

import { AdminLocaleSwitcher, useAdminT } from "@/i18n/admin";
import {
  AdminNotificationsMenu,
} from "@/components/admin/chrome/AdminNotificationsMenu";
import {
  AdminProfileMenu,
  type AdminProfileInfo,
} from "@/components/admin/chrome/AdminProfileMenu";
import { ADMIN_MD_BREAKPOINT } from "@/components/admin/chrome/nav";
import { SiteLogoMark } from "@/components/molecules/SiteLogoMark";
import Link from "next/link";

export const ADMIN_TOPBAR_HEIGHT = 56;

type Props = AdminProfileInfo & {
  showNotifications?: boolean;
};

export function AdminTopBar({
  showNotifications = false,
  ...profile
}: Props) {
  const t = useAdminT();

  return (
    <header
      className="admin-chrome__topbar"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 70,
        height: ADMIN_TOPBAR_HEIGHT,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        padding: "0 12px 0 16px",
        boxSizing: "border-box",
        background: "#0a0a0a",
        borderBottom: "1px solid #222",
      }}
    >
      <style>{`
        .admin-chrome__topbar-brand {
          display: flex;
          align-items: center;
          text-decoration: none;
          flex-shrink: 0;
        }
        .admin-chrome__topbar-brand .header-logo-mark {
          height: 22px;
          max-height: 22px;
          width: calc(22px * 1200 / 280);
        }
        .admin-chrome__topbar-actions {
          display: flex;
          align-items: center;
          gap: 8px;
          min-width: 0;
          flex-shrink: 0;
        }
        .admin-chrome__topbar-profile--desktop { display: none; }
        .admin-chrome__topbar-profile--mobile { display: flex; }
        @media (min-width: ${ADMIN_MD_BREAKPOINT}px) {
          .admin-chrome__topbar {
            padding-left: 20px !important;
            padding-right: 20px !important;
          }
          .admin-chrome__topbar-brand .header-logo-mark {
            height: 26px;
            max-height: 26px;
            width: calc(26px * 1200 / 280);
          }
          .admin-chrome__topbar-actions {
            gap: 10px;
          }
          .admin-chrome__topbar-profile--desktop { display: flex; }
          .admin-chrome__topbar-profile--mobile { display: none; }
        }
      `}</style>

      <Link
        href="/admin/"
        prefetch={false}
        className="admin-chrome__topbar-brand"
        aria-label={t.brand}
      >
        <SiteLogoMark idPrefix="admin-topbar" />
      </Link>

      <div className="admin-chrome__topbar-actions">
        <AdminLocaleSwitcher />
        {showNotifications ? <AdminNotificationsMenu /> : null}
        <div className="admin-chrome__topbar-profile--desktop">
          <AdminProfileMenu {...profile} />
        </div>
        <div className="admin-chrome__topbar-profile--mobile">
          <AdminProfileMenu {...profile} compact />
        </div>
      </div>
    </header>
  );
}
