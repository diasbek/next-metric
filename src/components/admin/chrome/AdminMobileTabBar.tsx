"use client";

import { useState } from "react";
import Link from "next/link";
import { useAdminT } from "@/i18n/admin";
import { AdminMoreSheet } from "@/components/admin/chrome/AdminMoreSheet";
import { AdminNavIcon, IconMore } from "@/components/admin/chrome/AdminNavIcons";
import {
  getActiveAdminNavHref,
  pickMobilePrimaryTabs,
  type AdminNavItem,
} from "@/components/admin/chrome/nav";

type Props = {
  items: AdminNavItem[];
  pathname: string;
};

export function AdminMobileTabBar({ items, pathname }: Props) {
  const t = useAdminT();
  const [moreOpen, setMoreOpen] = useState(false);
  const primary = pickMobilePrimaryTabs(items, 4);
  const primaryHrefSet = new Set(primary.map((item) => item.href));
  const activeHref = getActiveAdminNavHref(pathname, items);
  const onSecondaryRoute = Boolean(
    activeHref && !primaryHrefSet.has(activeHref),
  );
  const moreActive = moreOpen || onSecondaryRoute;

  return (
    <>
      <nav
        aria-label={t.chrome.adminNav}
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 60,
          display: "flex",
          alignItems: "stretch",
          gap: 2,
          padding: "6px 6px calc(6px + env(safe-area-inset-bottom, 0px))",
          background: "rgba(10,10,10,0.94)",
          borderTop: "1px solid #222",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
        }}
      >
        {primary.map((item) => {
          const active = item.href === activeHref;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              onClick={(e) => e.currentTarget.blur()}
              style={{
                flex: "1 1 0",
                minWidth: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 4,
                padding: "8px 4px",
                borderRadius: 0,
                border: "none",
                textDecoration: "none",
                color: active ? "#fff" : "#888",
                background: active ? "#1a1a1a" : "transparent",
                fontSize: 10,
                fontWeight: active ? 600 : 400,
                lineHeight: 1.15,
                textAlign: "center",
                boxSizing: "border-box",
                outline: "none",
              }}
            >
              <AdminNavIcon labelKey={item.labelKey} size={20} />
              <span
                style={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  maxWidth: "100%",
                }}
              >
                {t.nav[item.labelKey]}
              </span>
            </Link>
          );
        })}

        <button
          type="button"
          onClick={() => setMoreOpen(true)}
          aria-expanded={moreOpen}
          style={{
            flex: "1 1 0",
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
            padding: "8px 4px",
            borderRadius: 0,
            border: "none",
            cursor: "pointer",
            color: moreActive ? "#fff" : "#888",
            background: moreActive ? "#1a1a1a" : "transparent",
            fontSize: 10,
            fontWeight: moreActive ? 600 : 400,
            lineHeight: 1.15,
            boxSizing: "border-box",
            outline: "none",
          }}
        >
          <IconMore size={20} />
          <span
            style={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              maxWidth: "100%",
            }}
          >
            {t.chrome.more}
          </span>
        </button>
      </nav>

      <AdminMoreSheet
        open={moreOpen}
        onClose={() => setMoreOpen(false)}
        items={items}
        pathname={pathname}
      />
    </>
  );
}
