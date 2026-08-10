interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "section";
}

export function PageContainer({
  children,
  className = "",
  as: Tag = "div",
}: PageContainerProps) {
  return <Tag className={`page-container ${className}`.trim()}>{children}</Tag>;
}
