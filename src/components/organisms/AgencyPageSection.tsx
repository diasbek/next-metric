import {
  SectionTitle,
  Divider,
  PageContainer,
  SectionStickyHeading,
  SectionScrollColumn,
} from "@/components/atoms";
import { FAQAccordion } from "@/components/molecules";
import { AgencyTestimonialsCarousel } from "@/components/molecules/AgencyTestimonialsCarousel";
import { AgencyTeamSection } from "@/components/organisms/AgencyTeamSection";
import { WhyTMonogramSvg } from "@/components/molecules/WhyTMonogramSvg";
import type { LocalePageProps } from "@/i18n/props";

export function AgencyPageSection({ locale, content }: LocalePageProps) {
  const { agency, faq, ui } = content;

  return (
    <div className="bg-black pb-16 pt-28 md:pb-24">
      <PageContainer>
        <section
          className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-start lg:gap-[30px]"
          data-scroll-section
        >
          <h1 className="max-w-[701px] text-h2 text-white" data-split-title data-flip-id="page-title">
            {agency.about.titleLines[0]}{" "}
            <br />
            {agency.about.titleLines[1]}
          </h1>
          <div
            className="flex max-w-[440px] flex-col gap-4 text-body-lg leading-[1.1] text-white lg:ml-auto"

          >
            {agency.about.paragraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        </section>

        <section
          className="agency-t-banner relative mt-16 w-full bg-accent"
          data-scroll-section

        >
          <div className="agency-t-banner__stage">
            <div
              className="why-t-monogram why-t-monogram--agency"
              data-why-t-asset
            >
              <div className="why-t-monogram__brush" data-why-t-brush aria-hidden>
                <WhyTMonogramSvg idPrefix="agency-t-brush" showBlur />
              </div>
              <div className="why-t-monogram__sharp" data-why-t-sharp>
                <WhyTMonogramSvg idPrefix="agency-t-sharp" showBlur={false} />
              </div>
            </div>
          </div>
          <p className="agency-t-banner__founded">
            {ui.foundedIn} {agency.foundedYear}
            {ui.yearSuffix ? ` ${ui.yearSuffix}` : ""}
          </p>
        </section>

        <section className="mt-16" data-scroll-section>
          <Divider className="mb-0" />
          <SectionTitle className="mb-16 mt-10">
            {ui.factsTitle}
          </SectionTitle>
          <div className="grid grid-cols-2 gap-y-12 lg:grid-cols-4">
            {agency.stats.map((stat, i) => (
              <div
                key={stat.label}
                className={`flex flex-col gap-[30px] ${
                  i > 0 ? "border-l border-white/50 pl-6 lg:pl-[60px]" : ""
                }`}
              >
                <span
                  className="text-[clamp(3.5rem,10vw,6.4375rem)] font-medium leading-[1.1] tracking-[-0.02em] text-white"
                  data-counter
                >
                  {stat.value}
                </span>
                <span className="text-body-lg text-white">{stat.label}</span>
              </div>
            ))}
          </div>
        </section>

        <AgencyTeamSection locale={locale} content={content} />

        <section data-scroll-section>
          <Divider className="mt-16 mb-0" />
          <AgencyTestimonialsCarousel
            title={ui.clientsTitle}
            prevLabel={ui.prevTestimonial}
            nextLabel={ui.nextTestimonial}
            testimonials={agency.testimonials}
          />
        </section>

        <section className="agency-faq mt-10" data-scroll-section>
          <Divider className="mb-0" />
          <div className="agency-faq__grid">
            <SectionStickyHeading>
              <SectionTitle>{ui.faqTitle}</SectionTitle>
            </SectionStickyHeading>
            <SectionScrollColumn>
              <FAQAccordion items={faq} variant="agency" />
            </SectionScrollColumn>
          </div>
        </section>
      </PageContainer>
    </div>
  );
}
