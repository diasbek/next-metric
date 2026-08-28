import { canAccess, requireAdmin } from "@/lib/cms/auth";
import { getHomeCaseStudySlugs } from "@/lib/cms/home-cases";
import { getAdminProjects } from "@/lib/cms/projects";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getAdminMessages } from "@/i18n/admin";
import { getAdminUiLocale } from "@/i18n/admin/get-admin-locale";
import { AdminDashboardHome } from "@/components/admin/dashboard/AdminDashboardHome";

export default async function AdminHomePage() {
  const admin = await requireAdmin();
  const locale = await getAdminUiLocale();
  const t = getAdminMessages(locale);
  const supabase = await createSupabaseServerClient();

  const [projectsCount, drafts, leads, audit, homeSlugs, projects] = await Promise.all([
    supabase.from("metric_projects").select("id", { count: "exact", head: true }),
    supabase
      .from("metric_projects")
      .select("id", { count: "exact", head: true })
      .eq("status", "draft"),
    supabase.from("metric_leads").select("id", { count: "exact", head: true }).eq("status", "new"),
    canAccess(admin.role, "audit")
      ? supabase
          .from("metric_admin_audit_log")
          .select("id, actor_email, action, created_at, entity")
          .order("created_at", { ascending: false })
          .limit(8)
      : Promise.resolve({ data: null }),
    getHomeCaseStudySlugs(),
    getAdminProjects(),
  ]);

  const bySlug = new Map(projects.map((p) => [p.slug, p]));
  const homeCases = homeSlugs
    .map((slug, index) => {
      const project = bySlug.get(slug);
      if (!project) return null;
      const title =
        project.project_translations.find((tr) => tr.locale === "en")?.title ||
        project.slug;
      return {
        id: project.id,
        slug: project.slug,
        title,
        status: project.status,
        homeOrder: index + 1,
      };
    })
    .filter((row): row is NonNullable<typeof row> => row != null);

  const kpi = [
    { label: t.dashboard.works, value: String(projectsCount.count ?? 0), href: "/admin/works/" },
    {
      label: t.dashboard.onHomeWorks,
      value: String(homeCases.length),
      href: "/admin/works/?status=home",
    },
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
  ];

  const shortcuts = [
    { label: t.dashboard.homePage, href: "/admin/home/" },
    { label: t.dashboard.works, href: "/admin/works/" },
    { label: t.nav.leads, href: "/admin/leads/" },
    { label: t.dashboard.contacts, href: "/admin/contacts/" },
  ];

  const auditRows = canAccess(admin.role, "audit")
    ? ((audit.data ?? []) as Array<{
        id: string;
        actor_email: string;
        action: string;
        created_at: string;
        entity: string | null;
      }>).map((row) => ({
        id: row.id,
        actor_email: row.actor_email,
        action: row.action,
        created_at: row.created_at,
        entity_type: row.entity,
      }))
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
      homeCases={homeCases}
    />
  );
}
