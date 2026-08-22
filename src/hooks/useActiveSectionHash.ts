"use client";

import { useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { stripLocalePrefix } from "@/i18n/paths";
import { LOCATION_CHANGE_EVENT } from "@/utils/scroll";

function isHomePath(pathname: string): boolean {
  const { path } = stripLocalePrefix(pathname);
  const normalized = !path || path === "/" ? "/" : path.endsWith("/") ? path : `${path}/`;
  return normalized === "/";
}

function hashFromItemPath(path: string): string {
  const index = path.indexOf("#");
  if (index < 0) return "";
  return path.slice(index + 1).split("#")[0]?.trim() ?? "";
}

type SpyListener = () => void;

let spyHash = "";
let spyIdsKey = "";
let spyAttached = false;
let spyFrame = 0;
let spyTicking = false;
const spyListeners = new Set<SpyListener>();

function notifySpyListeners() {
  spyListeners.forEach((listener) => listener());
}

function readSpyHash(ids: string[]) {
  const header = document.querySelector<HTMLElement>("[data-site-header]");
  const probe = (header?.getBoundingClientRect().height ?? 88) + 12;
  let current = "";
  for (const id of ids) {
    const el = document.getElementById(id);
    if (!el) continue;
    if (el.getBoundingClientRect().top <= probe) current = id;
  }
  const next = current ? `#${current}` : "";
  if (next === spyHash) return;
  spyHash = next;
  notifySpyListeners();
}

function onSpyScroll() {
  if (spyTicking || !spyIdsKey) return;
  spyTicking = true;
  requestAnimationFrame(() => {
    spyTicking = false;
    readSpyHash(spyIdsKey.split("|").filter(Boolean));
  });
}

function attachSpy(idsKey: string) {
  spyIdsKey = idsKey;
  if (spyAttached) {
    onSpyScroll();
    return;
  }
  spyAttached = true;
  spyFrame = requestAnimationFrame(onSpyScroll);
  window.addEventListener("scroll", onSpyScroll, { passive: true });
  window.addEventListener("resize", onSpyScroll, { passive: true });
  window.addEventListener(LOCATION_CHANGE_EVENT, onSpyScroll);
  window.addEventListener("hashchange", onSpyScroll);
}

function detachSpy() {
  if (!spyAttached) return;
  spyAttached = false;
  spyIdsKey = "";
  spyHash = "";
  cancelAnimationFrame(spyFrame);
  window.removeEventListener("scroll", onSpyScroll);
  window.removeEventListener("resize", onSpyScroll);
  window.removeEventListener(LOCATION_CHANGE_EVENT, onSpyScroll);
  window.removeEventListener("hashchange", onSpyScroll);
}

function subscribeSpy(listener: SpyListener, idsKey: string) {
  spyListeners.add(listener);
  if (spyListeners.size === 1) attachSpy(idsKey);
  else if (idsKey !== spyIdsKey) attachSpy(idsKey);

  return () => {
    spyListeners.delete(listener);
    if (spyListeners.size === 0) detachSpy();
  };
}

/**
 * Home-page scroll spy. Returns the in-view section hash (`#services`)
 * so nav underlines match hash links while scrolling. `null` when not
 * on the homepage (caller should fall back to the URL hash).
 *
 * One shared window listener for all SiteNav instances.
 */
export function useActiveSectionHash(itemPaths: string[]): string | null {
  const pathname = usePathname();
  const onHome = isHomePath(pathname);
  const idsKey = itemPaths.map(hashFromItemPath).filter(Boolean).join("|");
  const enabled = onHome && Boolean(idsKey);

  const hash = useSyncExternalStore(
    (listener) => {
      if (!enabled) return () => undefined;
      return subscribeSpy(listener, idsKey);
    },
    () => (enabled ? spyHash : ""),
    () => "",
  );

  return enabled ? hash : null;
}
