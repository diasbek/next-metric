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
          event.altKey ||
          isTransitioning()
        ) {
          return;
        }

        const url = hrefToUrl(href);
        if (!url || url.startsWith("http")) return;

        const hash = getHashFromHref(url);

        // Same-document section links: never use Next router / page transitions.
        // router.push("/#x") while already on "/#y" stacks hashes and can leave
        // the exit fade stuck (white screen).
        if (hash && (url.startsWith("#") || isSameDocumentPath(url, pathname))) {
          event.preventDefault();
          navigateSameDocumentHash(hash);
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
