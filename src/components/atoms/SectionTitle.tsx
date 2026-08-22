import type { HTMLAttributes } from "react";

interface SectionTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
  className?: string;
  as?: "h1" | "h2" | "h3";
}

export function SectionTitle({
  children,
  className = "",
  as: Tag = "h2",
  ...rest
}: SectionTitleProps) {
  return (
    <Tag
      className={`text-h2 text-white ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  );
}
