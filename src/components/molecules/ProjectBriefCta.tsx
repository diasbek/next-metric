"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Button, type ButtonSize, type ButtonVariant } from "@/components/atoms/Button";
import { useProjectBrief } from "@/components/molecules/ProjectBriefProvider";

type ProjectBriefCtaProps = {
  href: string;
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} & Omit<ButtonHTMLAttributes<HTMLAnchorElement>, "type" | "children" | "href">;

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
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        event.preventDefault();
        open();
      }}
    >
      {children}
    </Button>
  );
}
