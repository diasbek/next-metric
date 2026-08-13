import { PageContainer } from "@/components/atoms/PageContainer";
import { MetricFaqList } from "@/components/molecules/MetricFaqList";
import type { MetricHomeContent } from "@/data/metric-home";
import type { FAQItem } from "@/data/faq";
import type { Locale } from "@/i18n/config";

export function MetricFaqSection({
  items,
  faq,
}: {
  locale?: Locale;
  items: FAQItem[];
  faq: MetricHomeContent["faq"];
}) {
  return (
    <section id={faq.id} className="metric-gradient-pink metric-section metric-faq">
      <PageContainer>
        <div className="metric-faq__grid">
          <div data-reveal>
            <h2 className="metric-faq__title font-display text-white">
              {faq.title}
            </h2>
            <p className="metric-faq__subtitle">{faq.subtitle}</p>
          </div>
          <MetricFaqList items={items} />
        </div>
      </PageContainer>
    </section>
  );
}
