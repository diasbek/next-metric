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
      prefetch={props.prefetch ?? true}
      onClick={(event) => {
        if (
          event.defaultPrevented ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey
        ) {
          onClick?.(event);
          return;
        }

        const url = hrefToUrl(href);
        if (!url || url.startsWith("http")) {
          onClick?.(event);
          return;
        }

        const hash = getHashFromHref(url);
        const sameDoc = url.startsWith("#") || isSameDocumentPath(url, pathname);
        const nextSearch = getSearchFromHref(url);
        const currentSearch =
          typeof window !== "undefined" ? window.location.search || "" : "";

        if (hash && sameDoc) {
          event.preventDefault();
          // Scroll first, then close mobile menu / other side effects so
          // body overflow unlock does not fight the jump.
          navigateSameDocumentHash(hash);
          onClick?.(event);
          return;
        }

        if (!hash && sameDoc && nextSearch !== currentSearch) {
          event.preventDefault();
          router.replace(url, { scroll: false });
          onClick?.(event);
          return;
        }

        if (!hash && sameDoc) {
          event.preventDefault();
          navigateSameDocumentTop();
          onClick?.(event);
          return;
        }

        onClick?.(event);
      }}
    />
  );
}
