import { TransitionLink } from "@/components/atoms/TransitionLink";
import {
  SectionTitle,
  Divider,
  PageContainer,
  SectionStickyHeading,
  SectionScrollColumn,
} from "@/components/atoms";
import type { LocalePageProps } from "@/i18n/props";
import { localePath } from "@/i18n/paths";

export function ServicesPageSection({ locale, content }: LocalePageProps) {
  const { services, ui } = content;

  return (
    <div className="bg-black pb-16 pt-28 md:pb-24">
      <PageContainer>
        <section className="section-split" data-scroll-section>
          <Divider data-border-draw />
          <div className="grid grid-cols-1 gap-16 lg:grid-cols-2">
            <SectionStickyHeading>
              <SectionTitle as="h1" split data-flip-id="page-title">
                {ui.whatWeDo}
              </SectionTitle>
            </SectionStickyHeading>

            <SectionScrollColumn className="flex flex-col" data-reveal-group>
              {services.map((service, index) => (
                <div key={service.id} className="services-page__item py-10" data-service-item>
                  {index > 0 && <Divider className="mb-10" data-border-draw />}
                  <h2 className="text-h2 text-white">{service.title}</h2>
                  <p className="mt-6 max-w-md text-body-lg text-white/80">
                    {service.fullDescription}
                  </p>
                  <p className="mt-6 flex gap-4 text-body-lg text-white">
                    <span>{service.price}</span>
                    <span className="text-white/40">/</span>
                    <span>{service.duration}</span>
                  </p>
                </div>
              ))}

              <TransitionLink
                href={localePath(locale, "/contacts/")}
                className="cta-bar mt-6 bg-white text-lg font-medium text-black transition-opacity hover:opacity-90"
                data-reveal
                data-reveal-delay="0.2"
              >
                {ui.orderService}
              </TransitionLink>
            </SectionScrollColumn>
          </div>
        </section>
      </PageContainer>
    </div>
  );
}
