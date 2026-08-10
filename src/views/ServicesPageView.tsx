import type { Locale } from "@/i18n/config";
import { getLocalePageProps } from "@/i18n/props";
import { SiteLayout } from "@/components/templates";
import { ServicesPageSection } from "@/components/organisms";

interface ServicesPageViewProps {
  locale: Locale;
}

export async function ServicesPageView({ locale }: ServicesPageViewProps) {
  const page = await getLocalePageProps(locale);

  return (
    <SiteLayout locale={locale}>
      <ServicesPageSection {...page} />
    </SiteLayout>
  );
}
