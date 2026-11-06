"use client";

import type { MouseEvent } from "react";
import { TransitionLink } from "@/components/atoms/TransitionLink";
import { useOptionalProjectBrief } from "@/components/molecules/ProjectBriefProvider";
import { localeBriefHref } from "@/i18n/paths";
import type { Locale } from "@/i18n/config";

const AR = (
  <span className="ar" aria-hidden="true">
    →
  </span>
);

type Props = {
  href?: string;
  brief?: boolean;
  locale?: Locale;
  className?: string;
  children: React.ReactNode;
  type?: "button" | "submit";
  onClick?: () => void;
};

function opensInBrowser(event: MouseEvent) {
  return (
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  );
}

/** Concept `.btn` — no legacy skewed `metric-cta` chrome. */
export function ProtoBtn({
  href,
  brief,
  locale = "en",
  className = "",
  children,
  type = "button",
  onClick,
}: Props) {
  const cls = ["btn", "mag", className].filter(Boolean).join(" ");
  const briefCtx = useOptionalProjectBrief();

  if (brief) {
    const briefHref = localeBriefHref(locale);
    return (
      <TransitionLink
        href={briefHref}
        className={cls}
        prefetch={false}
        onClickCapture={(event) => {
          if (!briefCtx || opensInBrowser(event)) return;
          event.preventDefault();
          briefCtx.open();
        }}
        onClick={onClick}
      >
        {children} {AR}
      </TransitionLink>
    );
  }
  if (href) {
    return (
      <TransitionLink href={href} className={cls} onClick={onClick}>
        {children} {AR}
      </TransitionLink>
    );
  }
  return (
    <button type={type} className={cls} onClick={onClick}>
      {children} {AR}
    </button>
  );
}
