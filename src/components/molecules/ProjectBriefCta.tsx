"use client";

import type { ButtonHTMLAttributes, MouseEvent, ReactNode } from "react";
import { Button, type ButtonSize, type ButtonVariant } from "@/components/atoms/Button";
import { useProjectBrief } from "@/components/molecules/ProjectBriefProvider";

type ProjectBriefCtaProps = {
  href: string;
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} & Omit<ButtonHTMLAttributes<HTMLAnchorElement>, "type" | "children" | "href">;

/** Modified clicks keep the plain-link behaviour (new tab, download, …). */
function opensInBrowser(event: MouseEvent<HTMLAnchorElement>): boolean {
  return (
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  );
}

export function ProjectBriefCta({
  href,
  children,
  onClick,
  variant,
  size,
  className,
  ...rest
}: ProjectBriefCtaProps) {
  const { open } = useProjectBrief();

  return (
    <Button
      href={href}
      variant={variant}
      size={size}
      className={className}
      {...rest}
      // Capture phase: TransitionLink handles same-document hrefs in its own
      // click handler and would consume the event before the modal can open.
      onClickCapture={(event: MouseEvent<HTMLAnchorElement>) => {
        if (opensInBrowser(event)) return;
        event.preventDefault();
        open();
      }}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}
