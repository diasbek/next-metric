"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ComponentProps } from "react";
import {
  isTransitioning,
  navigateWithTransition,
} from "@/animations/page-transition";

type TransitionLinkProps = ComponentProps<typeof Link>;

export function TransitionLink({ href, onClick, ...props }: TransitionLinkProps) {
  const router = useRouter();

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

        const url =
          typeof href === "string"
            ? href
            : typeof href === "object" && href !== null && "pathname" in href
              ? (href.pathname ?? "")
              : "";
        if (!url || url.startsWith("http") || url.startsWith("#")) return;

        event.preventDefault();
        void navigateWithTransition(url, () => router.push(url, { scroll: false }));
      }}
    />
  );
}
