import type { Locale } from "@/i18n/config";
import { getLocalePageProps } from "@/i18n/props";
import { SiteLayout } from "@/components/templates";
import { ContactsPageSection } from "@/components/organisms";

interface ContactsPageViewProps {
  locale: Locale;
}

export async function ContactsPageView({ locale }: ContactsPageViewProps) {
  const page = await getLocalePageProps(locale);

  return (
    <SiteLayout locale={locale}>
      <ContactsPageSection {...page} />
    </SiteLayout>
  );
}
