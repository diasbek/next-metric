import type { HTMLAttributes } from "react";

interface SectionTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
  className?: string;
  as?: "h1" | "h2" | "h3";
  split?: boolean;
}

export function SectionTitle({
  children,
  className = "",
  as: Tag = "h2",
  split = false,
  ...rest
}: SectionTitleProps) {
  return (
    <Tag
      className={`text-h2 text-white ${className}`}
      {...(split ? { "data-split-title": true } : {})}
      {...rest}
    >
      {children}
    </Tag>
  );
}
