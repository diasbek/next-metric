import { TransitionLink } from "@/components/atoms/TransitionLink";
import { PageContainer } from "@/components/atoms/PageContainer";
import { HeroLogo } from "@/components/organisms/Header";
import type { LocalePageProps } from "@/i18n/props";
import { localePath } from "@/i18n/paths";

export function HeroSection({ locale, content }: LocalePageProps) {
  const { hero, ui } = content;

  return (
    <section className="hero-section relative bg-black" data-hero-section data-scroll-section>
      <PageContainer className="h-full min-h-0">
        <HeroLogo />

        <div className="hero-bottom">
          <h1
            className="hero-bottom__title text-h1 text-white"
            data-split-title
            data-flip-id="page-title"
          >
            {hero.titleLines[0]}{" "}
            <br />
            {hero.titleLines[1]}
          </h1>

          <div className="hero-bottom__aside">
            <p
              className="text-[18px] font-normal capitalize leading-[1.2] tracking-[-0.36px] text-white"
              data-hero-services
            >
              <span>{hero.servicesLines[0]}</span>
              <br />
              <span>{hero.servicesLines[1]}</span>
              <br />
              <span>{hero.servicesLines[2]}</span>
            </p>

            <TransitionLink
              href={localePath(locale, "/contacts/")}
              data-hero-cta
              className="cta-square shrink-0 border border-white text-center text-body font-medium leading-none text-white transition-colors hover:bg-white hover:text-black"
            >
              {ui.discussProject}
            </TransitionLink>
          </div>
        </div>
      </PageContainer>
    </section>
  );
}
