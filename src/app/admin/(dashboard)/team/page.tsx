import { requirePermission } from "@/lib/cms/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { EMBED } from "@/lib/cms/embeds";
import { TeamEditor } from "@/components/admin/team/TeamEditor";
import {
  ADMIN_LOCALES,
  type TeamMemberDraft,
} from "@/components/admin/team/types";
import { AdminPageShell } from "@/components/admin/page-shell/AdminPageShell";
import { getAdminMessages } from "@/i18n/admin/get-admin-messages";
import { getAdminUiLocale } from "@/i18n/admin/get-admin-locale";

function toTeamDraft(row: {
  id: string;
  sort_order: number;
  status: string;
  image: string | null;
  image_object_position: string | null;
  is_director: boolean | null;
  team_member_translations?: Array<{
    locale: string;
    name: string;
    role: string;
  }>;
}): TeamMemberDraft {
  const translations = Object.fromEntries(
    ADMIN_LOCALES.map((locale) => {
      const tr = row.team_member_translations?.find(
        (t) => t.locale === locale.code,
      );
      return [
        locale.code,
        {
          locale: locale.code,
          name: tr?.name ?? "",
          role: tr?.role ?? "",
        },
      ];
    }),
  ) as TeamMemberDraft["translations"];

  return {
    id: row.id,
    sort_order: row.sort_order,
    status: row.status,
    image: row.image ?? "",
    image_object_position: row.image_object_position ?? "",
    is_director: Boolean(row.is_director),
    translations,
  };
}

export default async function AdminTeamPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  await requirePermission("content");
  const t = getAdminMessages(await getAdminUiLocale());
  const params = await searchParams;
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("metric_team_members")
    .select(`*, ${EMBED.teamMemberTranslations}`)
    .order("sort_order");

  const items = (data ?? []).map(toTeamDraft);
  const initialEditId =
    params.edit && items.some((item) => item.id === params.edit)
      ? params.edit
      : null;

  return (
    <AdminPageShell
      title={t.pages.team.title}
      publicPath="/agency/"
      description={t.pages.team.description}
      sections={[{ id: "content", label: t.pages.team.title }]}
      activeSection="content"
      basePath="/admin/team/"
    >
      <TeamEditor items={items} initialEditId={initialEditId} embedded />
    </AdminPageShell>
  );
}
