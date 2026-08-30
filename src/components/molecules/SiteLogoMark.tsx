import Image from "next/image";

interface SiteLogoMarkProps {
  idPrefix?: string;
  className?: string;
}

/** White Metric brand mark (pink M + light wordmark) for dark chrome. */
export function SiteLogoMark({
  className = "",
}: SiteLogoMarkProps) {
  return (
    <span data-header-logo-mark className={`header-logo-mark ${className}`.trim()}>
      <Image
        src="/images/metric/logo/metric-logo-white.svg"
        alt=""
        fill
        className="object-contain object-left"
        priority
      />
    </span>
  );
}
