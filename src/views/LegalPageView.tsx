import { PageContainer } from "@/components/atoms/PageContainer";
import { ProjectBriefCta } from "@/components/molecules/ProjectBriefCta";
import { SiteLayout } from "@/components/templates";
import type { Locale } from "@/i18n/config";
import { localeBriefHref } from "@/i18n/paths";
import { getMetricHomeResolved } from "@/lib/cms/metric-home";

const copy = {
  en: {
    newsletter: {
      title: "Newsletter",
      body: "Subscribe to METRIC updates on Amazon listing design, A+ Content, and conversion-led visual systems. Reach out via the contact form to join the list.",
    },
    careers: {
      title: "Careers",
      body: "We’re growing a team of Amazon designers and producers. Send a short intro and portfolio through the contact form — we’d love to hear from you.",
    },
  },
  de: {
    newsletter: {
      title: "Newsletter",
      body: "Erhalten Sie METRIC-Updates zu Amazon Listing-Design, A+ Content und conversionstarken Visuals. Melden Sie sich über das Kontaktformular für die Liste an.",
    },
    careers: {
      title: "Karriere",
      body: "Wir wachsen und suchen Amazon-Designer und Producer. Senden Sie eine kurze Vorstellung und Ihr Portfolio über das Kontaktformular.",
    },
  },
} as const;

type LegalKey = keyof typeof copy.en;

export async function LegalPageView({
  locale,
  page,
}: {
  locale: Locale;
  page: LegalKey;
}) {
  const content = copy[locale][page];
  const home = await getMetricHomeResolved(locale);

  return (
    <SiteLayout locale={locale} headerVariant="compact">
      <div className="metric-legal bg-white py-16 md:py-24">
        <PageContainer>
          <div className="metric-legal__inner" data-reveal>
            <p className="metric-legal__eyebrow">{home.footer.cities[0]}</p>
            <h1 className="metric-legal__title font-display text-foreground">
              {content.title}
            </h1>
            <p className="metric-legal__body">{content.body}</p>
            <ProjectBriefCta href={localeBriefHref(locale)} variant="primary" className="mt-10">
              {home.footer.startCta}
            </ProjectBriefCta>
          </div>
        </PageContainer>
      </div>
    </SiteLayout>
  );
}
