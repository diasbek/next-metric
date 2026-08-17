import type { Locale } from "@/i18n/config";
import { getLocalePageProps } from "@/i18n/props";
import { SiteLayout } from "@/components/templates";
import { WorksListingSection } from "@/components/organisms";

interface WorksPageViewProps {
  locale: Locale;
  category?: string;
  type?: string;
}

export async function WorksPageView({
  locale,
  category,
  type,
}: WorksPageViewProps) {
  const page = await getLocalePageProps(locale);

  return (
    <SiteLayout locale={locale}>
      <WorksListingSection {...page} category={category} type={type} />
    </SiteLayout>
  );
}
