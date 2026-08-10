import Image from "next/image";
import { PageContainer } from "@/components/atoms/PageContainer";
import { TransitionLink } from "@/components/atoms/TransitionLink";
import { metricHome } from "@/data/metric-home";
import type { LocalePageProps } from "@/i18n/props";
import { localePath } from "@/i18n/paths";

export function WorksListingSection({ locale, content }: LocalePageProps) {
  const { projects, ui } = content;

  return (
    <div className="bg-white pb-20 pt-10 md:pt-14">
      <PageContainer>
        <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <h1 className="font-display text-[clamp(42px,6vw,90px)] text-foreground">
            {ui.allProjects}
          </h1>
          <p className="max-w-md text-[18px] leading-[1.2] tracking-[-0.02em] text-[color:var(--muted)]">
            {metricHome.caseStudies.subtitle}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <TransitionLink
              key={project.slug}
              href={localePath(locale, `/works/${project.slug}/`)}
              className="group overflow-hidden rounded-[32px] bg-[color:var(--surface)]"
            >
              <div className="relative aspect-[4/5]">
                <Image
                  src={project.image}
                  alt={project.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <div className="p-6">
                <div className="mb-4 flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-foreground/20 px-3 py-1 text-sm"
                    >
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
              </div>
            </TransitionLink>
          ))}
        </div>
      </PageContainer>
    </div>
  );
}
