interface AnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
  as?: "section" | "div";
  reveal?: boolean;
  revealGroup?: boolean | "pop";
  stagger?: number;
}

export function AnimatedSection({
  children,
  className = "",
  as: Tag = "section",
  reveal = false,
  revealGroup = false,
  stagger,
}: AnimatedSectionProps) {
  const attrs: Record<string, string | number | boolean> = {};
  if (reveal) attrs["data-reveal"] = true;
  if (revealGroup) {
    attrs["data-reveal-group"] = revealGroup === "pop" ? "pop" : true;
    if (stagger !== undefined) attrs["data-reveal-stagger"] = stagger;
  }

  return (
    <Tag className={className} {...attrs}>
      {children}
    </Tag>
  );
}
