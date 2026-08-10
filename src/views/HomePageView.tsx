import type { Locale } from "@/i18n/config";
import { getLocalePageProps } from "@/i18n/props";
import { SiteLayout } from "@/components/templates";
import {
  MetricHeroSection,
  MetricTrustSection,
  MetricCategoriesSection,
  MetricCaseStudiesSection,
  MetricServicesSection,
  MetricWorkflowSection,
} from "@/components/organisms/MetricHomeSections";
import { MetricFaqSection } from "@/components/organisms/MetricFaqSection";

interface HomePageViewProps {
  locale: Locale;
}

export async function HomePageView({ locale }: HomePageViewProps) {
  const page = await getLocalePageProps(locale);

  return (
    <SiteLayout locale={locale} headerVariant="hero" showContact={false}>
      <MetricHeroSection locale={locale} />
      <MetricTrustSection />
      <MetricCategoriesSection />
      <MetricCaseStudiesSection locale={locale} />
      <MetricServicesSection locale={locale} />
      <MetricWorkflowSection locale={locale} />
      <MetricFaqSection items={page.content.faq} />
    </SiteLayout>
  );
}
