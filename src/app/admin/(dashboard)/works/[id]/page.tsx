import { Suspense } from "react";
import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/cms/auth";
import { getAdminProjectById } from "@/lib/cms/projects";
import { getAdminTags, getProjectTagIds } from "@/lib/cms/tags";
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
  const [project, libraryPaths, allTags, projectTagIds] = await Promise.all([
    getAdminProjectById(id),
    listRecentMediaFiles(120),
    getAdminTags(),
    getProjectTagIds(id),
  ]);
  if (!project) notFound();

  const library = libraryPaths.map((path) => ({
    path,
    url: getPublicMediaUrl(path),
  }));

  const activeTags = allTags.filter((tag) => tag.is_active);
  const categoryTags = activeTags.filter((tag) => tag.kind === "category");
  const typeTags = activeTags.filter((tag) => tag.kind === "type");
  const tagIdSet = new Set(projectTagIds);
  const categoryTagId =
    categoryTags.find((tag) => tagIdSet.has(tag.id))?.id ??
    allTags.find((tag) => tag.kind === "category" && tagIdSet.has(tag.id))
      ?.id ??
    "";
  const typeTagIds = allTags
    .filter((tag) => tag.kind === "type" && tagIdSet.has(tag.id))
    .map((tag) => tag.id);

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
    categoryTagId,
    typeTagIds,
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
      width: m.width ?? null,
      height: m.height ?? null,
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
    reviews: (project.project_reviews ?? [])
      .slice()
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((review) => {
        const byLocale = Object.fromEntries(
          (review.project_review_translations ?? []).map((tr) => [
            tr.locale,
            {
              author: tr.author ?? "",
              role: tr.role ?? "",
              quote: tr.quote ?? "",
            },
          ]),
        ) as Partial<Record<AdminLocale, { author: string; role: string; quote: string }>>;
        return {
          id: review.id,
          sort_order: review.sort_order ?? 0,
          person_image: review.person_image ?? "",
          translations: Object.fromEntries(
            ADMIN_LOCALES.map((locale) => [
              locale.code,
              byLocale[locale.code] ?? { author: "", role: "", quote: "" },
            ]),
          ) as ProjectEditorData["reviews"][number]["translations"],
        };
      }),
  };

  const tagOptions = [
    ...categoryTags,
    ...typeTags,
    // Keep assigned inactive tags selectable so save doesn't drop them silently
    ...allTags.filter(
      (tag) =>
        !tag.is_active &&
        tagIdSet.has(tag.id) &&
        !categoryTags.some((c) => c.id === tag.id) &&
        !typeTags.some((c) => c.id === tag.id),
    ),
  ].map((tag) => ({
    id: tag.id,
    slug: tag.slug,
    label: tag.is_active ? tag.label : `${tag.label} (inactive)`,
    kind: tag.kind,
  }));

  return (
    <Suspense fallback={null}>
      <ProjectEditor
        project={data}
        library={library}
        tagOptions={tagOptions}
      />
    </Suspense>
  );
}
