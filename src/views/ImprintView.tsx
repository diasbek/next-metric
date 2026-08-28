"use client";

import { PageContainer } from "@/components/atoms/PageContainer";
import { SiteLayout } from "@/components/templates";
import type { Locale } from "@/i18n/config";
import { SITE_CONFIG } from "@/utils/consts";

type Props = {
  locale: Locale;
};

export function ImprintView({ locale }: Props) {
  const isDe = locale === "de";
  const email = SITE_CONFIG.email;
  const phone = SITE_CONFIG.phone;
  const address = SITE_CONFIG.address;

  const copy = isDe
    ? {
        eyebrow: "Rechtliches",
        title: "Impressum",
        updated: "Stand: August 2026",
        sections: [
          {
            heading: "Angaben gemäß § 5 TMG",
            paragraphs: [
              `${SITE_CONFIG.name}`,
              ...address,
              phone ? `Telefon: ${phone}` : "",
              `E-Mail: ${email}`,
            ].filter(Boolean),
          },
          {
            heading: "Vertreten durch",
            paragraphs: [
              "Die vertretungsberechtigte Person und Handelsregisterangaben werden auf Anfrage unter der oben genannten E-Mail-Adresse mitgeteilt, sofern sie hier noch nicht vollständig hinterlegt sind.",
            ],
          },
          {
            heading: "Umsatzsteuer-ID",
            paragraphs: [
              "Umsatzsteuer-Identifikationsnummer gemäß § 27a Umsatzsteuergesetz: auf Anfrage.",
            ],
          },
          {
            heading: "Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV",
            paragraphs: [`${SITE_CONFIG.name}, ${address.join(", ")}`],
          },
          {
            heading: "Haftung für Inhalte und Links",
            paragraphs: [
              "Als Diensteanbieter sind wir gemäß § 7 Abs. 1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen.",
              "Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter verantwortlich.",
            ],
          },
        ],
      }
    : {
        eyebrow: "Legal",
        title: "Imprint",
        updated: "Last updated: August 2026",
        sections: [
          {
            heading: "Information according to § 5 TMG",
            paragraphs: [
              `${SITE_CONFIG.name}`,
              ...address,
              phone ? `Phone: ${phone}` : "",
              `Email: ${email}`,
            ].filter(Boolean),
          },
          {
            heading: "Represented by",
            paragraphs: [
              "Authorised representative and commercial register details are available on request at the email address above if not yet fully published here.",
            ],
          },
          {
            heading: "VAT ID",
            paragraphs: [
              "VAT identification number according to § 27a of the German VAT Act: available on request.",
            ],
          },
          {
            heading: "Responsible for content (§ 18 Abs. 2 MStV)",
            paragraphs: [`${SITE_CONFIG.name}, ${address.join(", ")}`],
          },
          {
            heading: "Liability for content and links",
            paragraphs: [
              "As a service provider we are responsible for our own content on these pages under general law. We are not obliged to monitor transmitted or stored third-party information.",
              "This site may contain links to external third-party websites. We have no influence on their content; the respective provider is always responsible.",
            ],
          },
        ],
      };

  return (
    <SiteLayout locale={locale}>
      <article className="metric-legal">
        <PageContainer className="metric-legal__shell">
          <p className="metric-legal__eyebrow">{copy.eyebrow}</p>
          <h1 className="metric-legal__title font-display">{copy.title}</h1>
          <p className="metric-legal__updated">{copy.updated}</p>
          {copy.sections.map((section) => (
            <section key={section.heading} className="metric-legal__section">
              <h2 className="metric-legal__heading">{section.heading}</h2>
              {section.paragraphs.map((p) => (
                <p key={p} className="metric-legal__text">
                  {p}
                </p>
              ))}
            </section>
          ))}
        </PageContainer>
      </article>
    </SiteLayout>
  );
}
