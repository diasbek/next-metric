import { notFound } from "next/navigation";
import { CaseDetailModal } from "@/components/molecules/CaseDetailModal";
import { WorkCaseSection } from "@/components/organisms/WorkCaseSection";
import type { Locale } from "@/i18n/config";
import { getProjectBySlug, getResolvedContent } from "@/i18n/get-content";

export async function CaseDetailModalPage({
  locale,
  slug,
}: {
  locale: Locale;
  slug: string;
}) {
  const [project, content] = await Promise.all([
    getProjectBySlug(locale, slug),
    getResolvedContent(locale),
  ]);

  if (!project) notFound();

  const authorName = project.author ?? project.title;

  return (
    <CaseDetailModal closeLabel={content.ui.closeMenu} title={authorName}>
      <WorkCaseSection
        locale={locale}
        content={content}
        project={project}
        presentation="modal"
      />
    </CaseDetailModal>
  );
}
