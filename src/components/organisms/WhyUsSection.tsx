import { PageContainer } from "@/components/atoms/PageContainer";
import { WhyTMonogramSvg } from "@/components/molecules/WhyTMonogramSvg";
import type { LocalePageProps } from "@/i18n/props";

export function WhyUsSection({ content }: LocalePageProps) {
  const { benefits, sections } = content;

  return (
    <section id="why-us" className="bg-black py-10 lg:py-16" data-scroll-section>
      <PageContainer>
        <div
          className="relative overflow-visible bg-accent px-8 py-16 md:px-12 md:py-24"
          data-clip-reveal
        >
          <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="mb-16 text-h2 text-white" data-reveal>
                {sections.whyUsTitleLines[0]}
                <br />
                {sections.whyUsTitleLines[1]}
              </h2>

              <ul className="flex flex-col gap-12 md:gap-14" data-reveal-group>
                {benefits.map((benefit) => (
                  <li
                    key={benefit}
                    className="grid grid-cols-[auto_1fr] gap-x-6 text-h4 leading-[1.1] text-white"
                  >
                    <span>/</span>
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div
              className="why-t-monogram relative flex items-center justify-center"
              data-why-t-asset
              data-reveal
            >
              <div className="why-t-monogram__brush" data-why-t-brush aria-hidden>
                <WhyTMonogramSvg idPrefix="why-t-brush" showBlur />
              </div>
              <div className="why-t-monogram__sharp" data-why-t-sharp>
                <WhyTMonogramSvg idPrefix="why-t-sharp" showBlur={false} />
              </div>
            </div>
          </div>
        </div>
      </PageContainer>
    </section>
  );
}
