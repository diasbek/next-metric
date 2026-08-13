"use client";

import { useEffect, useState } from "react";
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

/**
 * Home-page scroll spy. Returns the in-view section hash (`#services`)
 * so nav underlines match hash links while scrolling. `null` when not
 * on the homepage (caller should fall back to the URL hash).
 */
export function useActiveSectionHash(itemPaths: string[]): string | null {
  const pathname = usePathname();
  const onHome = isHomePath(pathname);
  const [activeHash, setActiveHash] = useState<string | null>(null);
  const idsKey = itemPaths.map(hashFromItemPath).filter(Boolean).join("|");

  useEffect(() => {
    if (!onHome) {
      setActiveHash(null);
      return;
    }

    const ids = idsKey.split("|").filter(Boolean);
    if (!ids.length) {
      setActiveHash("");
      return;
    }

    let ticking = false;

    const read = () => {
      const header = document.querySelector<HTMLElement>("[data-site-header]");
      const probe =
        (header?.getBoundingClientRect().height ?? 88) + 12;
      let current = "";
      for (const id of ids) {
        const el = document.getElementById(id);
        if (!el) continue;
        if (el.getBoundingClientRect().top <= probe) current = id;
      }
      const next = current ? `#${current}` : "";
      setActiveHash((prev) => (prev === next ? prev : next));
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        read();
      });
    };

    read();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    window.addEventListener(LOCATION_CHANGE_EVENT, onScroll);
    window.addEventListener("hashchange", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.removeEventListener(LOCATION_CHANGE_EVENT, onScroll);
      window.removeEventListener("hashchange", onScroll);
    };
  }, [onHome, idsKey]);

  return onHome ? activeHash : null;
}
