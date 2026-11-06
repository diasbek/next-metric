import type { Locale } from "@/i18n/config";
import { getLocalePageProps } from "@/i18n/props";
import { SiteLayout } from "@/components/templates";
import {
  MetricHeroSection,
  MetricProofSection,
  MetricCtrSection,
  MetricBandSection,
  MetricCategoriesSection,
  MetricCaseStudiesSection,
  MetricServicesSection,
  MetricWorkflowSection,
  MetricReviewsSection,
  MetricFaqSection,
  type HomeReview,
} from "@/components/organisms/MetricHomeSections";
import { getMetricHomeResolved } from "@/lib/cms/metric-home";
import { getActiveTags } from "@/lib/cms/tags";
import { ProtoFaqBind } from "@/components/proto/ProtoFaqBind";

interface HomePageViewProps {
  locale: Locale;
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "M";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

export async function HomePageView({ locale }: HomePageViewProps) {
  const [page, home, taxonomy] = await Promise.all([
    getLocalePageProps(locale),
    getMetricHomeResolved(locale),
    getActiveTags(locale),
  ]);

  const reviews: HomeReview[] = home.caseStudies.items
    .filter((item) => item.quote?.trim())
    .map((item) => ({
      slug: item.slug,
      quote: item.quote,
      author: item.author || item.title || item.slug,
      role: item.role || "",
      initials: initials(item.author || item.title || item.slug),
    }));

  return (
    <SiteLayout locale={locale} headerVariant="hero">
      <MetricHeroSection locale={locale} home={home} />
      <MetricProofSection locale={locale} home={home} />
      <MetricCtrSection locale={locale} home={home} />
      <MetricBandSection home={home} />
      <MetricCategoriesSection locale={locale} home={home} />
      <MetricCaseStudiesSection
        locale={locale}
        home={home}
        taxonomy={taxonomy}
      />
      <MetricServicesSection locale={locale} home={home} />
      <MetricWorkflowSection locale={locale} home={home} />
      <MetricReviewsSection locale={locale} reviews={reviews} />
      <MetricFaqSection
        locale={locale}
        items={page.content.faq}
        faq={home.faq}
      />
      <ProtoFaqBind />
    </SiteLayout>
  );
}
