import type { Locale } from "@/i18n/config";
import { getLocalePageProps } from "@/i18n/props";
import { SiteLayout } from "@/components/templates";
import { AgencyPageSection } from "@/components/organisms";

interface AgencyPageViewProps {
  locale: Locale;
}

export async function AgencyPageView({ locale }: AgencyPageViewProps) {
  const page = await getLocalePageProps(locale);

  return (
    <SiteLayout locale={locale}>
      <AgencyPageSection {...page} />
    </SiteLayout>
  );
}
