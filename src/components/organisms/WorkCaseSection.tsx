import Image from "next/image";
import { PageContainer } from "@/components/atoms/PageContainer";
import { TransitionLink } from "@/components/atoms/TransitionLink";
import { metricHome } from "@/data/metric-home";
import type { Project } from "@/data/projects";
import { getNextProjects } from "@/i18n/get-content";
import type { Locale } from "@/i18n/config";
import { localePath } from "@/i18n/paths";
import type { SiteContent } from "@/i18n/types";

interface WorkCaseSectionProps {
  locale: Locale;
  content: SiteContent;
  project: Project;
}

export async function WorkCaseSection({
  locale,
  content,
  project,
}: WorkCaseSectionProps) {
  const { ui } = content;
  const caseStudy = project.caseStudy;
  const nextProjects = await getNextProjects(locale, project.slug);
  const heroSrc = caseStudy?.heroImage ?? project.image;
  const gallery =
    caseStudy?.blocks.find((b) => b.type === "gallery")?.images ?? [];

  return (
    <article className="bg-white pb-20 pt-10">
      <PageContainer>
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <div>
            <p className="text-[18px] tracking-[-0.02em] text-accent">
              Metric Redesign
            </p>
            <h1 className="font-display mt-4 text-[clamp(42px,6vw,90px)] text-foreground">
              {project.title}
            </h1>
            <div className="mt-6 flex flex-wrap gap-[5px]">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="metric-pill border-foreground text-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
            <p className="mt-8 max-w-xl text-[clamp(18px,2vw,24px)] leading-[1.2] tracking-[-0.02em]">
              {project.description}
            </p>
            {caseStudy?.task ? (
              <div className="mt-10">
                <p className="text-sm uppercase tracking-[0.08em] text-[color:var(--muted)]">
                  {ui.task}
                </p>
                <p className="mt-2 text-[20px] leading-[1.3]">{caseStudy.task}</p>
              </div>
            ) : null}
            {caseStudy?.solution ? (
              <div className="mt-8">
                <p className="text-sm uppercase tracking-[0.08em] text-[color:var(--muted)]">
                  {ui.solution}
                </p>
                <p className="mt-2 text-[20px] leading-[1.3]">
                  {caseStudy.solution}
                </p>
              </div>
            ) : null}
          </div>

          <div className="relative">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[32px]">
              <Image
                src={heroSrc}
                alt={project.title}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            </div>
            {caseStudy?.metricValue ? (
              <div className="metric-glass absolute bottom-6 left-6 px-5 py-4">
                <p className="text-sm text-foreground/70">
                  {caseStudy.metricLabel}
                </p>
                <p className="text-[28px] font-semibold tracking-[-0.04em] text-foreground">
                  {caseStudy.metricValue}
                </p>
              </div>
            ) : null}
          </div>
        </div>

        {project.quote ? (
          <section className="mt-20 rounded-[40px] bg-[color:var(--surface)] p-8 md:p-14">
            <p className="text-[18px] font-medium tracking-[-0.02em] text-accent">
              Reviews
            </p>
            <blockquote className="font-display mt-4 max-w-4xl text-[clamp(28px,4vw,60px)] text-foreground">
              {project.quote}
            </blockquote>
            {project.author ? (
              <p className="mt-8 text-[28px] font-medium tracking-[-0.02em]">
                {project.author}
              </p>
            ) : null}
            {project.role ? (
              <p className="mt-2 text-[20px] text-[color:var(--muted)]">
                {project.role}
              </p>
            ) : null}
          </section>
        ) : null}

        {gallery.length > 1 ? (
          <section className="mt-12 grid gap-4 md:grid-cols-2">
            {gallery.slice(1).map((src) => (
              <div
                key={src}
                className="relative aspect-[4/3] overflow-hidden rounded-[28px]"
              >
                <Image src={src} alt="" fill className="object-cover" sizes="50vw" />
              </div>
            ))}
          </section>
        ) : null}

        <section className="mt-20">
          <div className="mb-8 flex items-end justify-between gap-4">
            <h2 className="font-display text-[clamp(36px,5vw,72px)] text-foreground">
              {ui.otherWorks}
            </h2>
            <TransitionLink
              href={localePath(locale, "/works/")}
              className="text-[18px] font-medium tracking-[-0.02em]"
            >
              {metricHome.caseStudies.moreLabel}
            </TransitionLink>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {nextProjects.map((item) => (
              <TransitionLink
                key={item.slug}
                href={localePath(locale, `/works/${item.slug}/`)}
                className="group overflow-hidden rounded-[28px] bg-[color:var(--surface)]"
              >
                <div className="relative aspect-[4/3]">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    sizes="33vw"
                  />
                </div>
                <div className="p-5">
                  <h3 className="text-[22px] font-medium tracking-[-0.02em]">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-[16px] text-[color:var(--muted)]">
                    {item.description}
                  </p>
                </div>
              </TransitionLink>
            ))}
          </div>
        </section>
      </PageContainer>
    </article>
  );
}
