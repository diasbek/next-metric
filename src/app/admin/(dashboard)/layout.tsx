import { AdminProviders } from "@/components/admin/AdminProviders";
import { AdminChrome, ADMIN_NAV_ITEMS } from "@/components/admin/chrome";
import { canAccess, requireAdmin } from "@/lib/cms/auth";
import { getAdminMessages } from "@/i18n/admin";
import { getAdminUiLocale } from "@/i18n/admin/get-admin-locale";
import {
  getSupabasePublishableKey,
  getSupabaseUrl,
} from "@/lib/supabase/env";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await requireAdmin();
  const locale = await getAdminUiLocale();
  const t = getAdminMessages(locale);
  const visibleNav = ADMIN_NAV_ITEMS.filter((item) =>
    canAccess(admin.role, item.area),
  );

  return (
    <AdminProviders
      locale={locale}
      messages={t}
      supabaseUrl={getSupabaseUrl()}
      supabasePublishableKey={getSupabasePublishableKey()}
    >
      <AdminChrome
        items={visibleNav}
        email={admin.email}
        role={admin.role}
        displayName={admin.displayName}
        jobTitle={admin.jobTitle}
        avatarUrl={admin.avatarUrl}
        showNotifications={canAccess(admin.role, "leads")}
      >
        {children}
      </AdminChrome>
    </AdminProviders>
  );
}
