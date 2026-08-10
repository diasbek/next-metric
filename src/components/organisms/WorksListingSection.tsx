import Image from "next/image";
import { PageContainer } from "@/components/atoms/PageContainer";
import { TransitionLink } from "@/components/atoms/TransitionLink";
import { getMetricHome } from "@/data/metric-home";
import type { LocalePageProps } from "@/i18n/props";
import { localePath } from "@/i18n/paths";

export function WorksListingSection({ locale, content }: LocalePageProps) {
  const { projects, ui } = content;
  const home = getMetricHome(locale);

  return (
    <div className="bg-white pb-20 pt-10 md:pt-14">
      <PageContainer>
        <div
          className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between"
          data-reveal
        >
          <h1 className="font-display text-[clamp(42px,6vw,90px)] text-foreground">
            {ui.allProjects}
          </h1>
          <p className="max-w-md text-[18px] leading-[1.2] tracking-[-0.02em] text-[color:var(--muted)]">
            {home.caseStudies.subtitle}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3" data-reveal-group>
          {projects.map((project) => (
            <TransitionLink
              key={project.slug}
              href={localePath(locale, `/works/${project.slug}/`)}
              className="metric-work-card group"
              data-reveal
            >
              <div className="metric-work-card__media overflow-hidden rounded-t-[32px]">
                <Image
                  src={project.image}
                  alt={project.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <div className="rounded-b-[32px] bg-[color:var(--surface)] p-6">
                <div className="mb-4 flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <span key={tag} className="metric-pill border-foreground/20 text-foreground">
                      {tag}
                    </span>
                  ))}
                </div>
                <h2 className="text-[28px] font-medium tracking-[-0.02em]">
                  {project.title}
                </h2>
                <p className="mt-2 text-[16px] text-[color:var(--muted)]">
                  {project.description}
                </p>
                <span className="metric-cta metric-cta--dark metric-cta--skew mt-6 inline-flex">
                  <span className="metric-cta__label">{home.caseStudies.viewLabel}</span>
                </span>
              </div>
            </TransitionLink>
          ))}
        </div>
      </PageContainer>
    </div>
  );
}
