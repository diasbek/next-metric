import Link from "next/link";
import { Divider, PageContainer, SectionStickyHeading, SectionScrollColumn } from "@/components/atoms";
import type { LocalePageProps } from "@/i18n/props";
import { localePath } from "@/i18n/paths";

/** Figma Frame 26 ellipses — 145:3283 / 3287 / 3291. */
const SERVICE_BLOBS = [
  "services-blob services-blob--a",
  "services-blob services-blob--b",
  "services-blob services-blob--c",
] as const;

export function ServicesSection({ locale, content }: LocalePageProps) {
  const { services, ui } = content;

  return (
    <section
      id="services"
      data-blobs-section
      className="services-section section-y relative bg-black"
      data-scroll-section
    >
      <div className="services-blobs pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        {SERVICE_BLOBS.map((className) => (
          <div key={className} data-blob className={className} />
        ))}
      </div>

      <PageContainer className="relative z-[1]">
        <Divider />
        <div className="section-split grid grid-cols-1 gap-16 lg:grid-cols-2 lg:gap-x-[30px]">
          <SectionStickyHeading reveal>
            <h2 className="text-h2 text-white">{ui.whatWeDo}</h2>
          </SectionStickyHeading>

          <SectionScrollColumn className="flex flex-col" data-reveal-group>
            {services.map((service, index) => (
              <div
                key={service.id}
                className={`services-section__item flex flex-col gap-6 py-10 ${
                  index > 0 ? "border-t border-white/20" : ""
                }`}
              >
                <h3 className="text-h2 text-white">{service.title}</h3>
                <p className="max-w-[377px] text-body-lg text-white">
                  {service.shortDescription}
                </p>
              </div>
            ))}

            <Link
              href={localePath(locale, "/services/")}
              data-reveal
              className="cta-bar mt-10 w-full bg-white text-lg font-medium text-black transition-opacity hover:opacity-90"
            >
              {ui.allServices}
            </Link>
          </SectionScrollColumn>
        </div>
      </PageContainer>
    </section>
  );
}
