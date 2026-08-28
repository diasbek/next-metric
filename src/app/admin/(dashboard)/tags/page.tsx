import { Suspense } from "react";
import { requirePermission } from "@/lib/cms/auth";
import { getAdminTags } from "@/lib/cms/tags";
import { TagsEditor } from "@/components/admin/tags/TagsEditor";
import { AdminPageShell } from "@/components/admin/page-shell/AdminPageShell";
import { getAdminMessages } from "@/i18n/admin/get-admin-messages";
import { getAdminUiLocale } from "@/i18n/admin/get-admin-locale";

export default async function AdminTagsPage() {
  await requirePermission("content");
  const t = getAdminMessages(await getAdminUiLocale());
  const tags = await getAdminTags();

  return (
    <AdminPageShell
      title={t.pages.tags.title}
      publicPath="/works/"
      description={t.pages.tags.description}
      sections={[{ id: "content", label: t.pages.tags.sectionLabel }]}
      activeSection="content"
      basePath="/admin/tags/"
    >
      <Suspense fallback={null}>
        <TagsEditor items={tags} />
      </Suspense>
    </AdminPageShell>
  );
}
