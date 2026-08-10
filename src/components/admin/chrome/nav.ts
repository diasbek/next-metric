import type { AdminPermissionArea } from "@/lib/cms/auth";
import type { AdminMessages } from "@/i18n/admin/types";

export type AdminNavLabelKey = keyof AdminMessages["nav"];

export type AdminNavItem = {
  href: string;
  labelKey: AdminNavLabelKey;
  area: AdminPermissionArea;
};

/** Full sidebar / sheet order. */
export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { href: "/admin/", labelKey: "overview", area: "content" },
  { href: "/admin/metric-home/", labelKey: "home", area: "content" },
  { href: "/admin/agency/", labelKey: "agency", area: "content" },
  { href: "/admin/works/", labelKey: "works", area: "content" },
  { href: "/admin/services/", labelKey: "services", area: "content" },
  { href: "/admin/contacts/", labelKey: "contacts", area: "content" },
  { href: "/admin/leads/", labelKey: "leads", area: "leads" },
  { href: "/admin/media/", labelKey: "media", area: "media" },
  { href: "/admin/users/", labelKey: "users", area: "users" },
  { href: "/admin/settings/", labelKey: "settings", area: "settings" },
];

/** Preferred primary tabs on mobile (filled from visible nav by priority). */
export const ADMIN_MOBILE_PRIMARY_KEYS: AdminNavLabelKey[] = [
  "overview",
  "works",
  "leads",
  "media",
];

export const ADMIN_MD_BREAKPOINT = 768;

export function isAdminNavActive(pathname: string, href: string): boolean {
  const path = pathname.endsWith("/") && pathname !== "/" ? pathname : `${pathname}/`;
  const target = href.endsWith("/") ? href : `${href}/`;
  if (target === "/admin/") {
    return path === "/admin/" || path === "/admin";
  }
  return path === target || path.startsWith(target);
}

type SoftNavFn = (href: string) => void;

let softNavImpl: SoftNavFn | null = null;

/** Wired by AdminSoftNavBridge inside the dashboard providers. */
export function registerAdminSoftNav(fn: SoftNavFn): () => void {
  softNavImpl = fn;
  return () => {
    if (softNavImpl === fn) softNavImpl = null;
  };
}

/** Soft App Router navigation (no full document reload). */
export function softAdminNav(href: string) {
  if (typeof window === "undefined") return;
  if (softNavImpl) {
    softNavImpl(href);
    return;
  }
  // Auth pages / before bridge mounts — full navigation is fine.
  window.location.assign(href);
}

/** Full reload — login/logout and auth boundary only. */
export function hardAdminNav(href: string) {
  if (typeof window === "undefined") return;
  window.location.assign(href);
}

export function pickMobilePrimaryTabs(
  visible: AdminNavItem[],
  max = 4,
): AdminNavItem[] {
  const picked: AdminNavItem[] = [];
  for (const key of ADMIN_MOBILE_PRIMARY_KEYS) {
    const item = visible.find((v) => v.labelKey === key);
    if (item) picked.push(item);
    if (picked.length >= max) return picked;
  }
  for (const item of visible) {
    if (picked.some((p) => p.href === item.href)) continue;
    picked.push(item);
    if (picked.length >= max) break;
  }
  return picked;
}
