import type { Locale } from "@/i18n/config";
import { getLocalePageProps } from "@/i18n/props";
import { SiteLayout } from "@/components/templates";
import {
  MetricHeroSection,
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
    <SiteLayout locale={locale} headerVariant="hero">
      <MetricHeroSection locale={locale} />
      <MetricCategoriesSection locale={locale} />
      <MetricCaseStudiesSection locale={locale} />
      <MetricServicesSection locale={locale} />
      <MetricWorkflowSection locale={locale} />
      <MetricFaqSection locale={locale} items={page.content.faq} />
    </SiteLayout>
  );
}
