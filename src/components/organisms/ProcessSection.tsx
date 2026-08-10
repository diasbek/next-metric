import { Divider, PageContainer, SectionStickyHeading, SectionScrollColumn } from "@/components/atoms";
import type { LocalePageProps } from "@/i18n/props";

export function ProcessSection({ content }: LocalePageProps) {
  const { processSteps, sections } = content;

  return (
    <section id="process" className="section-y bg-black" data-scroll-section>
      <PageContainer>
        <Divider />
        <div className="section-split grid grid-cols-1 gap-16 lg:grid-cols-[1fr_1.2fr]">
          <SectionStickyHeading reveal>
            <h2 className="text-h2 text-white">
              {sections.processTitle[0]}
              <br />
              {sections.processTitle[1]}
            </h2>
          </SectionStickyHeading>

          <SectionScrollColumn className="flex flex-col gap-20" data-reveal-group>
            {processSteps.map((step, index) => (
              <div key={step.title} className="relative">
                {index > 0 && (
                  <div
                    className="absolute -top-10 left-0 right-0 border-t border-white/20"
                    data-border-draw
                  />
                )}

                <div className="grid grid-cols-[auto_1fr] gap-x-11">
                  <span className="pt-1 text-xl font-medium tracking-[-0.02em] text-white">
                    {step.number}
                  </span>

                  <div className="flex flex-col gap-7">
                    <h3 className="text-h4 text-white">{step.title}</h3>
                    <p className="text-body-lg text-white">{step.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </SectionScrollColumn>
        </div>
      </PageContainer>
    </section>
  );
}
