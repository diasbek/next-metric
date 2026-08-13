import Image from "next/image";
import { TransitionLink } from "@/components/atoms/TransitionLink";
import type { Project } from "@/data/projects";
import type { Locale } from "@/i18n/config";
import { localePath } from "@/i18n/paths";

interface ProjectTagProps {
  label: string;
}

export function ProjectTag({ label }: ProjectTagProps) {
  return <span className="project-tag">{label}</span>;
}

interface ProjectCardProps {
  locale: Locale;
  project: Project;
  linkable?: boolean;
  className?: string;
  dataAttributes?: Record<string, string>;
}

export function ProjectCard({
  locale,
  project,
  linkable = true,
  className = "",
  dataAttributes,
}: ProjectCardProps) {
  const content = (
    <article className={`flex flex-col gap-5 ${className}`.trim()}>
      <div
        className="relative aspect-[701/486] w-full overflow-hidden"
        data-flip-id={`work-image-${project.slug}`}
      >
        <Image
          src={project.image}
          alt={project.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 50vw"
          quality={85}
        />
      </div>

      <div className="flex flex-col gap-5">
        <div className="project-card__copy flex flex-col gap-3.5">
          <h3 className="text-h3 text-white">{project.title}</h3>
          <p className="project-card__description text-body text-white">
            {project.description}
          </p>
        </div>

        <div className="project-tags">
          {project.tags.map((tag) => (
            <ProjectTag key={tag} label={tag} />
          ))}
        </div>
      </div>
    </article>
  );

  if (linkable) {
    return (
      <TransitionLink
        href={localePath(locale, `/works/${project.slug}/`)}
        className="group block"
        data-work-item
        data-sphere={dataAttributes?.sphere ?? project.sphere}
        data-tags={dataAttributes?.tags ?? project.tags.join("|")}
        data-featured={project.featured ? "true" : "false"}
        data-slug={project.slug}
      >
        {content}
      </TransitionLink>
    );
  }

  return content;
}
