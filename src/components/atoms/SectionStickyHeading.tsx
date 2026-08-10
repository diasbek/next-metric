interface SectionStickyHeadingProps {
  children: React.ReactNode;
  className?: string;
  reveal?: boolean;
}

export function SectionStickyHeading({
  children,
  className = "",
  reveal = false,
}: SectionStickyHeadingProps) {
  return (
    <div
      className={`section-sticky-heading ${className}`.trim()}
      {...(reveal ? { "data-reveal": true } : {})}
    >
      {children}
    </div>
  );
}
