import Image from "next/image";
import Link from "next/link";
import { PageContainer } from "@/components/atoms/PageContainer";
import { ProjectCard, ProjectTag } from "@/components/molecules/ProjectCard";
import type { LocalePageProps } from "@/i18n/props";
import { localePath } from "@/i18n/paths";

export function WorksSection({ locale, content }: LocalePageProps) {
  const { projects, ui } = content;
  const featured = projects.find((project) => project.featured);
  const gridProjects = projects.filter((project) => !project.featured).slice(0, 6);

  return (
    <section id="works" className="bg-black py-10 lg:py-16" data-scroll-section>
      <PageContainer>
        {featured && (
          <Link
            href={localePath(locale, `/works/${featured.slug}/`)}
            className="group mb-10 block"
            data-reveal
          >
            <div className="js-parallax relative aspect-[1432/902] w-full overflow-hidden">
              <Image
                src={featured.image}
                alt={featured.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                sizes="(max-width: 768px) 100vw, (max-width: 1280px) 90vw, 1200px"
              />
            </div>

            <div className="mt-8 flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
              <div className="flex flex-col gap-3.5">
                <h2 className="text-h3 text-white">{featured.title}</h2>
                <p className="project-card__description text-body text-white">
                  {featured.description}
                </p>
              </div>

              <div className="project-tags md:shrink-0">
                {featured.tags.map((tag) => (
                  <ProjectTag key={tag} label={tag} />
                ))}
              </div>
            </div>
          </Link>
        )}

        <div className="grid-projects" data-reveal-group>
          {gridProjects.map((project) => (
            <ProjectCard key={project.slug} locale={locale} project={project} />
          ))}
        </div>

        <div className="mt-16 grid-projects" data-reveal>
          <Link
            href={localePath(locale, "/works/")}
            className="cta-bar col-span-1 border border-white/30 text-lg font-medium text-white transition-colors hover:border-white lg:col-start-2"
          >
            {ui.otherWorks}
          </Link>
        </div>
      </PageContainer>
    </section>
  );
}
