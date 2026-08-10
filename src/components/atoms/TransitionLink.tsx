"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ComponentProps } from "react";
import {
  isTransitioning,
  navigateWithTransition,
} from "@/animations/page-transition";
import {
  getHashFromHref,
  isSameDocumentPath,
  navigateSameDocumentHash,
  navigateSameDocumentTop,
} from "@/utils/scroll";

type TransitionLinkProps = ComponentProps<typeof Link>;

function hrefToUrl(href: TransitionLinkProps["href"]): string {
  if (typeof href === "string") return href;
  if (typeof href === "object" && href !== null && "pathname" in href) {
    const path = href.pathname ?? "";
    const hash =
      typeof href.hash === "string" ? href.hash.replace(/^#/, "").split("#")[0] : "";
    return hash ? `${path || "/"}#${hash}` : path;
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

        // Block native navigation while a page transition runs — otherwise
        // Next Link falls through and can stack hashes / flash white.
        if (isTransitioning()) {
          event.preventDefault();
          return;
        }

        const url = hrefToUrl(href);
        if (!url || url.startsWith("http")) return;

        const hash = getHashFromHref(url);
        const sameDoc = url.startsWith("#") || isSameDocumentPath(url, pathname);

        // Same-document section links: never use Next router / page transitions.
        if (hash && sameDoc) {
          event.preventDefault();
          navigateSameDocumentHash(hash);
          return;
        }

        // Logo / home on the current page: clear hash + scroll top, no transition.
        if (!hash && sameDoc) {
          event.preventDefault();
          navigateSameDocumentTop();
          return;
        }

        event.preventDefault();
        void navigateWithTransition(url, () =>
          router.push(url, { scroll: false }),
        );
      }}
    />
  );
}
