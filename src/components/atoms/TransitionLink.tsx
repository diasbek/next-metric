"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ComponentProps } from "react";
import {
  getHashFromHref,
  getSearchFromHref,
  isSameDocumentPath,
  navigateSameDocumentHash,
  navigateSameDocumentTop,
} from "@/utils/scroll";

type PageTransitionMod = typeof import("@/animations/page-transition");

let transitionMod: PageTransitionMod | null = null;
let transitionLoad: Promise<PageTransitionMod> | null = null;

function loadPageTransition(): Promise<PageTransitionMod> {
  transitionLoad ??= import("@/animations/page-transition").then((mod) => {
    transitionMod = mod;
    return mod;
  });
  return transitionLoad;
}

type TransitionLinkProps = ComponentProps<typeof Link>;

function hrefToUrl(href: TransitionLinkProps["href"]): string {
  if (typeof href === "string") return href;
  if (typeof href === "object" && href !== null && "pathname" in href) {
    const path = href.pathname ?? "";
    const search =
      typeof href.search === "string"
        ? href.search.startsWith("?")
          ? href.search
          : href.search
            ? `?${href.search}`
            : ""
        : "";
    const hash =
      typeof href.hash === "string" ? href.hash.replace(/^#/, "").split("#")[0] : "";
    const base = `${path || "/"}${search}`;
    return hash ? `${base}#${hash}` : base;
  }
  return "";
}

export function TransitionLink({ href, onClick, ...props }: TransitionLinkProps) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <Link
      href={href}
      {...props}
      onClick={(event) => {
        onClick?.(event);
        if (
          event.defaultPrevented ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey
        ) {
          return;
        }

        // Don't swallow clicks while a previous transition is in flight —
        // reset and continue so production slow navigations stay interruptible.
        if (transitionMod?.isTransitioning()) {
          transitionMod.resetPageTransition();
        }

        const url = hrefToUrl(href);
        if (!url || url.startsWith("http")) return;

        const hash = getHashFromHref(url);
        const sameDoc = url.startsWith("#") || isSameDocumentPath(url, pathname);
        const nextSearch = getSearchFromHref(url);
        const currentSearch =
          typeof window !== "undefined" ? window.location.search || "" : "";

        // Same-document section links: never use Next router / page transitions.
        if (hash && sameDoc) {
          event.preventDefault();
          navigateSameDocumentHash(hash);
          return;
        }

        // Same path, different query (e.g. /works/?category=Listing) — update
        // filters without a full-page FLIP or a forced scroll-to-top.
        if (!hash && sameDoc && nextSearch !== currentSearch) {
          event.preventDefault();
          router.replace(url, { scroll: false });
          return;
        }

        // Logo / home on the current page: clear hash + scroll top, no transition.
        if (!hash && sameDoc) {
          event.preventDefault();
          navigateSameDocumentTop();
          return;
        }

        event.preventDefault();
        void loadPageTransition().then((mod) => {
          if (mod.isTransitioning()) mod.resetPageTransition();
          return mod.navigateWithTransition(url, () =>
            router.push(url, { scroll: false }),
          );
        });
      }}
    />
  );
}
