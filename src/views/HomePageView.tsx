import type { Locale } from "@/i18n/config";
import { getLocalePageProps } from "@/i18n/props";
import { SiteLayout } from "@/components/templates";
import {
  HeroSection,
  WorksSection,
  ServicesSection,
  ProcessSection,
  WhyUsSection,
} from "@/components/organisms";

interface HomePageViewProps {
  locale: Locale;
}

export async function HomePageView({ locale }: HomePageViewProps) {
  const page = await getLocalePageProps(locale);

  return (
    <SiteLayout locale={locale} headerVariant="hero">
      <HeroSection {...page} />
      <WorksSection {...page} />
      <ServicesSection {...page} />
      <ProcessSection {...page} />
      <WhyUsSection {...page} />
    </SiteLayout>
  );
}
