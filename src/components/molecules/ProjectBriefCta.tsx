"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Button, type ButtonSize, type ButtonVariant } from "@/components/atoms/Button";
import { useProjectBrief } from "@/components/molecules/ProjectBriefProvider";

type ProjectBriefCtaProps = {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type" | "children">;

export function ProjectBriefCta({
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
      type="button"
      variant={variant}
      size={size}
      className={className}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) open();
      }}
      {...rest}
    >
      {children}
    </Button>
  );
}
