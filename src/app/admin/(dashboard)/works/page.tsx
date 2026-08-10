import { Suspense } from "react";
import { requirePermission } from "@/lib/cms/auth";
import { getAdminProjects } from "@/lib/cms/projects";
import { ProjectsList } from "@/components/admin/projects/ProjectsList";
import { AdminPageShell } from "@/components/admin/page-shell/AdminPageShell";
import { getAdminMessages } from "@/i18n/admin/get-admin-messages";
import { getAdminUiLocale } from "@/i18n/admin/get-admin-locale";

export default async function AdminWorksPage() {
  await requirePermission("content");
  const t = getAdminMessages(await getAdminUiLocale());
  const projects = await getAdminProjects();

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
            const ru = project.project_translations.find((t) => t.locale === "en");
            return {
              id: project.id,
              slug: project.slug,
              status: project.status,
              cover_image: project.cover_image ?? "",
              title: ru?.title || project.slug,
            };
          })}
        />
      </Suspense>
    </AdminPageShell>
  );
}
