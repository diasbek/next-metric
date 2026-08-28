"use client";

import type { MouseEvent, ReactNode } from "react";
import Link from "next/link";
import { useAdminT } from "@/i18n/admin";
import { AdminNavIcon } from "@/components/admin/chrome/AdminNavIcons";
import {
  ADMIN_TOPBAR_HEIGHT,
} from "@/components/admin/chrome/AdminTopBar";
import {
  getActiveAdminNavHref,
  type AdminNavItem,
} from "@/components/admin/chrome/nav";

type Props = {
  items: AdminNavItem[];
  pathname: string;
};

function blurNavTarget(event: MouseEvent<HTMLAnchorElement>) {
  // Soft nav keeps :focus on the clicked link; clear mouse focus so only
  // the route-based active style remains (not leftover outline boxes).
  event.currentTarget.blur();
}

export function AdminDesktopSidebar({ items, pathname }: Props) {
  const t = useAdminT();
  const activeHref = getActiveAdminNavHref(pathname, items);

  return (
    <aside
      className="admin-sidebar"
      style={{
        position: "sticky",
        top: ADMIN_TOPBAR_HEIGHT,
        flex: "0 0 240px",
        width: 240,
        height: `calc(100svh - ${ADMIN_TOPBAR_HEIGHT}px)`,
        maxHeight: `calc(100svh - ${ADMIN_TOPBAR_HEIGHT}px)`,
        borderRight: "1px solid #222",
        padding: "16px 12px",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        background: "#0a0a0a",
        boxSizing: "border-box",
      }}
    >
      <nav
        aria-label={t.chrome.adminNav}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          flex: "1 1 auto",
          minHeight: 0,
          overflowY: "auto",
          paddingBottom: 8,
        }}
      >
        {items.map((item) => {
          const active = item.href === activeHref;
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={false}
              className={`admin-nav-link${active ? " is-active" : ""}`}
              aria-current={active ? "page" : undefined}
              onClick={blurNavTarget}
            >
              <AdminNavIcon
                labelKey={item.labelKey}
                size={17}
                style={{ opacity: active ? 1 : 0.75 }}
              />
              <span>{t.nav[item.labelKey]}</span>
            </Link>
          );
        })}
      </nav>

      <div
        style={{
          flexShrink: 0,
          paddingTop: 12,
          borderTop: "1px solid #222",
          display: "grid",
          gap: 10,
        }}
      >
        <Link
          href="/"
          target="_blank"
          rel="noreferrer"
          prefetch={false}
          className="admin-nav-link admin-nav-link--muted"
          onClick={blurNavTarget}
        >
          {t.chrome.site}
        </Link>
      </div>
    </aside>
  );
}

export function AdminNavList({
  items,
  pathname,
  onNavigate,
}: {
  items: AdminNavItem[];
  pathname: string;
  onNavigate?: () => void;
}): ReactNode {
  const t = useAdminT();
  const activeHref = getActiveAdminNavHref(pathname, items);
  return (
    <nav aria-label={t.chrome.adminNav} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {items.map((item) => {
        const active = item.href === activeHref;
        return (
          <Link
            key={item.href}
            href={item.href}
            prefetch={false}
            className={`admin-nav-link admin-nav-link--sheet${active ? " is-active" : ""}`}
            aria-current={active ? "page" : undefined}
            onClick={(e) => {
              blurNavTarget(e);
              onNavigate?.();
            }}
          >
            <AdminNavIcon
              labelKey={item.labelKey}
              size={18}
              style={{ opacity: active ? 1 : 0.8 }}
            />
            <span>{t.nav[item.labelKey]}</span>
          </Link>
        );
      })}
    </nav>
  );
}
