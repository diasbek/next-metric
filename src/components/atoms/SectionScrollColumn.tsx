interface SectionScrollColumnProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export function SectionScrollColumn({
  children,
  className = "",
  ...props
}: SectionScrollColumnProps) {
  return (
    <div className={className} {...props}>
      {children}
    </div>
  );
}
