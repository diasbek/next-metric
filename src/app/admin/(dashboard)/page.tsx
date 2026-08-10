import { canAccess, requireAdmin } from "@/lib/cms/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getAdminMessages } from "@/i18n/admin";
import { getAdminUiLocale } from "@/i18n/admin/get-admin-locale";
import { AdminDashboardHome } from "@/components/admin/dashboard/AdminDashboardHome";

export default async function AdminHomePage() {
  const admin = await requireAdmin();
  const locale = await getAdminUiLocale();
  const t = getAdminMessages(locale);
  // Session + RLS — dashboard must not crash when SUPABASE_SECRET_KEY is unset.
  const supabase = await createSupabaseServerClient();

  const [projects, drafts, leads, services, audit] = await Promise.all([
    supabase.from("metric_projects").select("id", { count: "exact", head: true }),
    supabase
      .from("metric_projects")
      .select("id", { count: "exact", head: true })
      .eq("status", "draft"),
    supabase.from("metric_leads").select("id", { count: "exact", head: true }).eq("status", "new"),
    supabase.from("metric_services").select("id", { count: "exact", head: true }),
    canAccess(admin.role, "audit")
      ? supabase
          .from("admin_audit_log")
          .select("id, actor_email, action, created_at, entity_type")
          .order("created_at", { ascending: false })
          .limit(8)
      : Promise.resolve({ data: null }),
  ]);

  const kpi = [
    { label: t.dashboard.works, value: String(projects.count ?? 0), href: "/admin/works/" },
    {
      label: t.dashboard.draftWorks,
      value: String(drafts.count ?? 0),
      href: "/admin/works/?status=draft",
    },
    {
      label: t.dashboard.newLeads,
      value: String(leads.count ?? 0),
      href: "/admin/leads/?status=new",
    },
    { label: t.dashboard.services, value: String(services.count ?? 0), href: "/admin/services/" },
  ];

  const shortcuts = [
    { label: t.dashboard.homePage, href: "/admin/metric-home/" },
    { label: t.dashboard.agencyPage, href: "/admin/agency/" },
    { label: t.dashboard.contacts, href: "/admin/contacts/" },
  ];

  const auditRows = canAccess(admin.role, "audit")
    ? ((audit.data ?? []) as Array<{
        id: string;
        actor_email: string;
        action: string;
        created_at: string;
        entity_type: string | null;
      }>)
    : null;

  return (
    <AdminDashboardHome
      title={t.dashboard.title}
      kpi={kpi}
      shortcuts={shortcuts}
      shortcutsTitle={t.dashboard.quickLinks}
      auditTitle={t.dashboard.recentAudit}
      noAudit={t.dashboard.noAudit}
      auditRows={auditRows}
      locale={locale}
    />
  );
}
