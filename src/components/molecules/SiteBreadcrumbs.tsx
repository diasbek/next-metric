import Link from "next/link";

export type BreadcrumbItem = {
  name: string;
  path: string;
};

type SiteBreadcrumbsProps = {
  items: BreadcrumbItem[];
  className?: string;
};

/** Visible trail matching BreadcrumbList JSON-LD paths. */
export function SiteBreadcrumbs({ items, className = "" }: SiteBreadcrumbsProps) {
  if (items.length < 2) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className={`site-breadcrumbs ${className}`.trim()}
    >
      <ol className="site-breadcrumbs__list">
        {items.map((item, index) => {
          const last = index === items.length - 1;
          return (
            <li key={`${item.path}-${index}`} className="site-breadcrumbs__item">
              {last ? (
                <span aria-current="page" className="site-breadcrumbs__current">
                  {item.name}
                </span>
              ) : (
                <>
                  <Link href={item.path} className="site-breadcrumbs__link">
                    {item.name}
                  </Link>
                  <span className="site-breadcrumbs__sep" aria-hidden>
                    /
                  </span>
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
