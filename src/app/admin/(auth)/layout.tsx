import { AdminProviders } from "@/components/admin/AdminProviders";
import { getAdminMessages } from "@/i18n/admin";
import { getAdminUiLocale } from "@/i18n/admin/get-admin-locale";

export default async function AdminAuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getAdminUiLocale();
  const messages = getAdminMessages(locale);
  return (
    <AdminProviders locale={locale} messages={messages}>
      {children}
    </AdminProviders>
  );
}
