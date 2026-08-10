import type { Locale } from "@/i18n/config";
import { getLocalePageProps } from "@/i18n/props";
import { SiteLayout } from "@/components/templates";
import { WorksListingSection } from "@/components/organisms";

interface WorksPageViewProps {
  locale: Locale;
}

export async function WorksPageView({ locale }: WorksPageViewProps) {
  const page = await getLocalePageProps(locale);

  return (
    <SiteLayout locale={locale}>
      <WorksListingSection {...page} />
    </SiteLayout>
  );
}
