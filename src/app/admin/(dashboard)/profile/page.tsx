import { requireAdmin } from "@/lib/cms/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { ProfileEditor } from "@/components/admin/profile/ProfileEditor";

export default async function AdminProfilePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const admin = await requireAdmin();
  const params = await searchParams;
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("metric_admin_users")
    .select(
      "email, role, display_name, job_title, bio, avatar_url, last_login_at, created_at",
    )
    .eq("user_id", admin.id)
    .maybeSingle();

  return (
    <ProfileEditor
      profile={{
        id: admin.id,
        email: data?.email ?? admin.email,
        role: (data?.role as "owner" | "editor") ?? admin.role,
        display_name: data?.display_name ?? "",
        job_title: data?.job_title ?? "",
        bio: data?.bio ?? "",
        avatar_url: data?.avatar_url ?? "",
        last_login_at: data?.last_login_at ?? null,
        created_at: data?.created_at ?? null,
      }}
      saved={Boolean(params.saved)}
      passwordSaved={Boolean(params.password)}
    />
  );
}
