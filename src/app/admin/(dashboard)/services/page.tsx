import { requirePermission } from "@/lib/cms/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { ServicesEditor } from "@/components/admin/services/ServicesEditor";
import type { ServiceDraft } from "@/components/admin/services/types";
import { ADMIN_LOCALES } from "@/components/admin/services/types";
import { AdminPageShell } from "@/components/admin/page-shell/AdminPageShell";
import { getAdminMessages } from "@/i18n/admin/get-admin-messages";
import { getAdminUiLocale } from "@/i18n/admin/get-admin-locale";

function toDraft(row: {
  id: string;
  service_key: string;
  sort_order: number;
  status: string;
  service_translations?: Array<{
    locale: string;
    title: string;
    short_description: string;
    full_description: string;
    price: string;
    duration: string;
  }>;
}): ServiceDraft {
  const translations = Object.fromEntries(
    ADMIN_LOCALES.map((locale) => {
      const tr = row.service_translations?.find((t) => t.locale === locale.code);
      return [
        locale.code,
        {
          locale: locale.code,
          title: tr?.title ?? "",
          short: tr?.short_description ?? "",
          full: tr?.full_description ?? "",
          price: tr?.price ?? "",
          duration: tr?.duration ?? "",
        },
      ];
    }),
  ) as ServiceDraft["translations"];

  return {
    id: row.id,
    service_key: row.service_key,
    sort_order: row.sort_order,
    status: row.status,
    translations,
  };
}

export default async function AdminServicesPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  await requirePermission("content");
  const t = getAdminMessages(await getAdminUiLocale());
  const params = await searchParams;
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("services")
    .select("*, service_translations(*)")
    .order("sort_order");

  const items = (data ?? []).map(toDraft);
  const initialEditId =
    params.edit && items.some((item) => item.id === params.edit) ? params.edit : null;

  return (
    <AdminPageShell
      title={t.pages.services.title}
      publicPath="/services/"
      description={t.pages.services.description}
      sections={[{ id: "content", label: t.pages.services.sectionLabel }]}
      activeSection="content"
      basePath="/admin/services/"
    >
      <ServicesEditor items={items} initialEditId={initialEditId} embedded />
    </AdminPageShell>
  );
}
