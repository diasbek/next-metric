import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/cms/auth";
import { getAdminProjectById } from "@/lib/cms/projects";
import { getPublicMediaUrl, listRecentMediaFiles } from "@/lib/cms/storage";
import {
  ProjectEditor,
  type ProjectEditorData,
} from "@/components/admin/projects/ProjectEditor";
import type { ProjectBlockType } from "@/lib/cms/types";
import { ADMIN_LOCALES, type AdminLocale } from "@/components/admin/ui/locales";

export default async function AdminProjectEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePermission("content");
  const { id } = await params;
  const [project, libraryPaths] = await Promise.all([
    getAdminProjectById(id),
    listRecentMediaFiles(48),
  ]);
  if (!project) notFound();

  const library = libraryPaths.map((path) => ({
    path,
    url: getPublicMediaUrl(path),
  }));

  const translations = Object.fromEntries(
    ADMIN_LOCALES.map((locale) => {
      const tr = project.project_translations.find((t) => t.locale === locale.code);
      return [
        locale.code,
        {
          locale: locale.code as AdminLocale,
          title: tr?.title ?? "",
          description: tr?.description ?? "",
          tags: (tr?.tags ?? []).join(", "),
          case_year: tr?.case_year ?? "",
          case_task: tr?.case_task ?? "",
          case_solution: tr?.case_solution ?? "",
          author: tr?.author ?? "",
          role: tr?.role ?? "",
          quote: tr?.quote ?? "",
          meta_title: tr?.meta_title ?? "",
          meta_description: tr?.meta_description ?? "",
          keywords: tr?.keywords ?? "",
        },
      ];
    }),
  ) as ProjectEditorData["translations"];

  const data: ProjectEditorData = {
    id: project.id,
    slug: project.slug,
    status: project.status,
    sphere: project.sphere ?? "",
    sort_order: project.sort_order ?? 0,
    featured: Boolean(project.featured),
    cover_image: project.cover_image ?? "",
    og_image: project.og_image ?? "",
    seo_indexable: project.seo_indexable !== false,
    translations,
    media: (project.project_media ?? []).map((m) => ({
      id: m.id,
      kind: m.kind,
      url: m.url,
      alt: m.alt ?? "",
      sort_order: m.sort_order ?? 0,
      block_id: m.block_id ?? null,
    })),
    blocks: (project.project_blocks ?? [])
      .slice()
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((b) => ({
        id: b.id,
        type: b.type as ProjectBlockType,
        sort_order: b.sort_order ?? 0,
        youtube_url: b.youtube_url ?? "",
      })),
  };

  return <ProjectEditor project={data} library={library} />;
}
