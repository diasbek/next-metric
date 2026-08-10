import { HeroLogoSvg } from "@/components/molecules/HeroLogoSvg";

interface SiteLogoMarkProps {
  idPrefix?: string;
  className?: string;
}

export function SiteLogoMark({
  idPrefix = "site-logo",
  className = "",
}: SiteLogoMarkProps) {
  return (
    <span data-header-logo-mark className={`header-logo-mark ${className}`.trim()}>
      <HeroLogoSvg color="#FAFAFA" idPrefix={idPrefix} showBlur={false} />
    </span>
  );
}
