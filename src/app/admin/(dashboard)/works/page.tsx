import { Suspense } from "react";
import { requirePermission } from "@/lib/cms/auth";
import { getHomeCaseStudySlugs } from "@/lib/cms/home-cases";
import { getAdminProjects } from "@/lib/cms/projects";
import { ProjectsList } from "@/components/admin/projects/ProjectsList";
import { AdminPageShell } from "@/components/admin/page-shell/AdminPageShell";
import { getAdminMessages } from "@/i18n/admin/get-admin-messages";
import { getAdminUiLocale } from "@/i18n/admin/get-admin-locale";

export default async function AdminWorksPage() {
  await requirePermission("content");
  const t = getAdminMessages(await getAdminUiLocale());
  const [projects, homeSlugs] = await Promise.all([
    getAdminProjects(),
    getHomeCaseStudySlugs(),
  ]);
  const homeOrder = new Map(homeSlugs.map((slug, index) => [slug, index + 1]));

  return (
    <AdminPageShell
      title={t.pages.works.title}
      publicPath="/works/"
      description={t.pages.works.description}
      sections={[{ id: "content", label: t.pages.works.sectionLabel }]}
      activeSection="content"
      basePath="/admin/works/"
    >
      <Suspense fallback={null}>
        <ProjectsList
          embedded
          projects={projects.map((project) => {
            const ru = project.project_translations.find((tr) => tr.locale === "en");
            const onHomeOrder = homeOrder.get(project.slug) ?? null;
            return {
              id: project.id,
              slug: project.slug,
              status: project.status,
              cover_image: project.cover_image ?? "",
              title: ru?.title || project.slug,
              onHome: onHomeOrder != null,
              homeOrder: onHomeOrder,
            };
          })}
        />
      </Suspense>
    </AdminPageShell>
  );
}
