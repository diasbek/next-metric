import { requirePermission } from "@/lib/cms/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { ContactsPageAdmin } from "@/components/admin/page-shell/ContactsPageAdmin";
import type { CmsLocale } from "@/lib/cms/types";

const LOCALES: CmsLocale[] = ["en", "de"];

const emptyLocale = {
  address_lines: "",
  presentation_url: "",
  brief_url: "",
};

export default async function AdminContactsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  await requirePermission("content");
  const params = await searchParams;
  const supabase = createSupabaseAdminClient();

  const [{ data: settings }, { data: translations }] = await Promise.all([
    supabase.from("site_settings").select("*").eq("id", 1).maybeSingle(),
    supabase.from("site_settings_translations").select("*"),
  ]);

  const byLocale = Object.fromEntries(
    LOCALES.map((locale) => {
      const row = translations?.find((t) => t.locale === locale);
      const fallbackAddress =
        locale === "en" ? (settings?.address_lines ?? []) : [];
      return [
        locale,
        {
          address_lines: (row?.address_lines?.length
            ? row.address_lines
            : fallbackAddress
          ).join("\n"),
          presentation_url:
            row?.presentation_url ||
            (locale === "en" ? (settings?.presentation_url ?? "") : ""),
          brief_url:
            row?.brief_url ||
            (locale === "en" ? (settings?.brief_url ?? "") : ""),
        },
      ];
    }),
  ) as Record<CmsLocale, typeof emptyLocale>;

  return (
    <ContactsPageAdmin
      saved={params.saved === "1"}
      contacts={{
        phone: settings?.phone ?? "",
        email: settings?.email ?? "",
        telegram_url: settings?.telegram_url ?? "",
        instagram_url: settings?.instagram_url ?? "",
      }}
      translations={byLocale}
    />
  );
}
