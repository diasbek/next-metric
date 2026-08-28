"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useAdminT } from "@/i18n/admin";
import { AdminNavIcon } from "@/components/admin/chrome/AdminNavIcons";
import {
  ADMIN_TOPBAR_HEIGHT,
} from "@/components/admin/chrome/AdminTopBar";
import {
  adminChromeNavLink,
  adminChromeNavLinkActive,
} from "@/components/admin/chrome/menuStyles";
import {
  isAdminNavActive,
  type AdminNavItem,
} from "@/components/admin/chrome/nav";

type Props = {
  items: AdminNavItem[];
  pathname: string;
};

export function AdminDesktopSidebar({ items, pathname }: Props) {
  const t = useAdminT();

  return (
    <aside
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
          const active = isAdminNavActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                ...adminChromeNavLink,
                ...(active ? adminChromeNavLinkActive : null),
              }}
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
          style={{
            ...adminChromeNavLink,
            color: "#aaa",
          }}
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
  return (
    <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {items.map((item) => {
        const active = isAdminNavActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => onNavigate?.()}
            style={{
              ...adminChromeNavLink,
              padding: "12px 14px",
              fontSize: 15,
              ...(active ? adminChromeNavLinkActive : null),
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
