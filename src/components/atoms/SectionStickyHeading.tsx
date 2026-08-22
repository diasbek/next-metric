interface SectionStickyHeadingProps {
  children: React.ReactNode;
  className?: string;
}

export function SectionStickyHeading({
  children,
  className = "",
}: SectionStickyHeadingProps) {
  return (
    <div className={`section-sticky-heading ${className}`.trim()}>
      {children}
    </div>
  );
}
