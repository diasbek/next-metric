import { PageContainer } from "@/components/atoms/PageContainer";
import { SiteLayout } from "@/components/templates";
import { CookiePreferencesButton } from "@/components/consent";
import type { Locale } from "@/i18n/config";
import { SITE_CONFIG } from "@/utils/consts";

type CookieRow = {
  name: string;
  provider: string;
  purpose: string;
  duration: string;
  category: string;
};

type Section = {
  heading: string;
  paragraphs?: string[];
  list?: string[];
};

type PrivacyCopy = {
  eyebrow: string;
  title: string;
  updated: string;
  intro: string[];
  sections: Section[];
  cookieHeading: string;
  cookieIntro: string;
  cookieColumns: {
    name: string;
    provider: string;
    purpose: string;
    duration: string;
    category: string;
  };
  cookieRows: CookieRow[];
  manageCookies: string;
  contactHeading: string;
  contactParagraphs: string[];
};

const COOKIE_ROWS_EN: CookieRow[] = [
  {
    name: "_ym_uid, _ym_d, _ym_isad",
    provider: "Yandex Metrika",
    purpose: "Distinguishes visitors, records clicks/scroll for traffic analytics",
    duration: "Up to 1 year",
    category: "Analytics",
  },
  {
    name: "_ga, _ga_*",
    provider: "Google Analytics",
    purpose: "Distinguishes visitors across sessions",
    duration: "Up to 2 years",
    category: "Analytics",
  },
  {
    name: "_gid",
    provider: "Google Analytics",
    purpose: "Distinguishes visitors within a day",
    duration: "24 hours",
    category: "Analytics",
  },
  {
    name: "Container-defined (varies)",
    provider: "Google Tag Manager",
    purpose: "Loads and manages other analytics/marketing tags we configure",
    duration: "Varies by tag",
    category: "Analytics",
  },
  {
    name: "metric_cookie_consent",
    provider: "METRIC (first-party, browser storage)",
    purpose: "Remembers your cookie choice so we don't ask again",
    duration: "Until you clear browser storage",
    category: "Necessary",
  },
  {
    name: "sb-*-auth-token",
    provider: "Supabase (first-party)",
    purpose: "Keeps admin users signed in to the content dashboard",
    duration: "Session / up to 7 days",
    category: "Necessary — admin panel only",
  },
  {
    name: "admin_ui_locale",
    provider: "METRIC (first-party)",
    purpose: "Remembers the admin dashboard's display language",
    duration: "1 year",
    category: "Necessary — admin panel only",
  },
  {
    name: "cf_clearance / hCaptcha cookies",
    provider: "Cloudflare Turnstile or hCaptcha (if enabled)",
    purpose: "Distinguishes humans from bots on the contact form",
    duration: "Session",
    category: "Necessary — only when the contact form is active",
  },
];

const COOKIE_ROWS_DE: CookieRow[] = [
  {
    name: "_ym_uid, _ym_d, _ym_isad",
    provider: "Yandex Metrika",
    purpose: "Unterscheidet Besucher, erfasst Klicks/Scroll für die Traffic-Analyse",
    duration: "Bis zu 1 Jahr",
    category: "Analyse",
  },
  {
    name: "_ga, _ga_*",
    provider: "Google Analytics",
    purpose: "Unterscheidet Besucher über mehrere Sitzungen hinweg",
    duration: "Bis zu 2 Jahre",
    category: "Analyse",
  },
  {
    name: "_gid",
    provider: "Google Analytics",
    purpose: "Unterscheidet Besucher innerhalb eines Tages",
    duration: "24 Stunden",
    category: "Analyse",
  },
  {
    name: "Container-abhängig (variiert)",
    provider: "Google Tag Manager",
    purpose: "Lädt und verwaltet weitere von uns konfigurierte Analyse-/Marketing-Tags",
    duration: "Abhängig vom Tag",
    category: "Analyse",
  },
  {
    name: "metric_cookie_consent",
    provider: "METRIC (First-Party, Browserspeicher)",
    purpose: "Speichert Ihre Cookie-Entscheidung, damit wir nicht erneut fragen",
    duration: "Bis der Browserspeicher geleert wird",
    category: "Notwendig",
  },
  {
    name: "sb-*-auth-token",
    provider: "Supabase (First-Party)",
    purpose: "Hält Admin-Nutzer im Content-Dashboard angemeldet",
    duration: "Sitzung / bis zu 7 Tage",
    category: "Notwendig — nur Admin-Bereich",
  },
  {
    name: "admin_ui_locale",
    provider: "METRIC (First-Party)",
    purpose: "Speichert die Anzeigesprache des Admin-Dashboards",
    duration: "1 Jahr",
    category: "Notwendig — nur Admin-Bereich",
  },
  {
    name: "cf_clearance / hCaptcha-Cookies",
    provider: "Cloudflare Turnstile oder hCaptcha (falls aktiviert)",
    purpose: "Unterscheidet Menschen von Bots im Kontaktformular",
    duration: "Sitzung",
    category: "Notwendig — nur bei aktivem Kontaktformular",
  },
];

function buildCopy(locale: Locale, contactEmail: string): PrivacyCopy {
  if (locale === "de") {
    return {
      eyebrow: "Rechtliches",
      title: "Datenschutzerklärung",
      updated: "Zuletzt aktualisiert: August 2026",
      intro: [
        "Diese Datenschutzerklärung erklärt, welche personenbezogenen Daten METRIC („wir“, „uns“) verarbeitet, wenn Sie diese Website besuchen oder unser Kontaktformular nutzen, sowie Ihre Rechte nach der Datenschutz-Grundverordnung (DSGVO) und anderen anwendbaren Gesetzen.",
      ],
      sections: [
        {
          heading: "1. Verantwortlicher",
          paragraphs: [
            "Verantwortlich für die Datenverarbeitung auf dieser Website ist:",
          ],
          list: [
            "[Vollständiger rechtlicher Firmenname]",
            "[Eingetragene Geschäftsadresse]",
            "[Land / Registrierungsjurisdiktion]",
            "[Handelsregisternummer, falls zutreffend]",
            `E-Mail: ${contactEmail}`,
          ],
        },
        {
          heading: "2. EU-Vertreter (Art. 27 DSGVO)",
          paragraphs: [
            "Sofern METRIC keine Niederlassung in der EU hat, aber Daten von Personen in der EU verarbeitet, benennen wir einen EU-Vertreter gemäß Art. 27 DSGVO:",
          ],
          list: ["[Name und Anschrift des EU-Vertreters, falls zutreffend]"],
        },
        {
          heading: "3. Welche Daten wir verarbeiten",
          paragraphs: [
            "Kontaktformular: Wenn Sie unser Kontaktformular ausfüllen, verarbeiten wir Ihren Namen, Ihre Telefonnummer, Ihre Nachricht, optional eine angehängte Datei sowie das Formularfeld für die Zustimmung und den Zeitpunkt der Übermittlung.",
            "Technische Daten: Bei jedem Seitenaufruf verarbeiten unser Hosting-Anbieter und unsere Sicherheitsdienste (z. B. Bot-/Spam-Schutz) automatisch technische Daten wie IP-Adresse, Zeitstempel und grundlegende Anfrageinformationen, um Missbrauch zu verhindern und die Website betriebsbereit zu halten.",
            "Analyse-Daten: Wir verarbeiten Nutzungsdaten (z. B. besuchte Seiten, Klicks, ungefähre Herkunft) über Yandex Metrika und/oder Google Analytics bzw. Google Tag Manager.",
          ],
        },
        {
          heading: "4. Rechtsgrundlagen",
          list: [
            "Bearbeitung von Anfragen über das Kontaktformular: Art. 6 Abs. 1 lit. b DSGVO (vorvertragliche Maßnahmen) bzw. lit. f (berechtigtes Interesse an der Beantwortung von Anfragen).",
            "Sicherheit, Betrugs- und Spam-Prävention (IP-Verarbeitung, Rate-Limiting, Captcha): Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse am sicheren Betrieb der Website).",
            "Analyse-Cookies (Yandex Metrika, Google Analytics/Tag Manager): Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an der Reichweitenmessung).",
          ],
        },
        {
          heading: "5. Empfänger und Auftragsverarbeiter",
          paragraphs: [
            "Wir geben Daten nur an Dienstleister weiter, die uns beim Betrieb dieser Website unterstützen:",
          ],
          list: [
            "Supabase, Inc. — Datenbank-, Speicher- und Authentifizierungs-Infrastruktur für Anfragen und Datei-Uploads.",
            "Telegram (Telegram FZ-LLC) — interne Benachrichtigung unseres Teams über neue Anfragen (Name, Telefonnummer, Nachricht, Hinweis auf Anhang).",
            "Cloudflare Turnstile bzw. hCaptcha — Bot-/Spam-Schutz für das Kontaktformular, sofern aktiviert.",
            "Yandex LLC (Yandex Metrika) und Google LLC / Google Ireland Limited (Google Analytics, Google Tag Manager) — Website-Analyse.",
            "[Hosting-Anbieter] — Bereitstellung der Website-Infrastruktur.",
          ],
        },
        {
          heading: "6. Internationale Datenübermittlungen",
          paragraphs: [
            "Einige der oben genannten Dienstleister verarbeiten Daten außerhalb des Europäischen Wirtschaftsraums (z. B. in den USA oder Russland). Sofern Daten von EU-Nutzern in Drittländer ohne Angemessenheitsbeschluss übermittelt werden, stützen wir uns auf geeignete Garantien wie EU-Standardvertragsklauseln oder vergleichbare Mechanismen mit dem jeweiligen Anbieter. Details erhalten Sie auf Anfrage.",
          ],
        },
        {
          heading: "7. Speicherdauer",
          list: [
            "Kontaktanfragen (metric_leads): gespeichert, solange dies zur Bearbeitung Ihrer Anfrage erforderlich ist, in der Regel [12 Monate] nach der letzten Interaktion, danach werden Datensatz und angehängte Datei gelöscht.",
            "Analyse-Daten: gemäß den Aufbewahrungsfristen von Yandex Metrika / Google Analytics.",
            "Admin-Konten und Audit-Protokolle: für die Dauer des Beschäftigungsverhältnisses bzw. der Geschäftsbeziehung sowie zur Erfüllung gesetzlicher Aufbewahrungspflichten.",
          ],
        },
        {
          heading: "8. Ihre Rechte",
          paragraphs: [
            "Nach der DSGVO haben Sie das Recht auf:",
          ],
          list: [
            "Auskunft über die von uns verarbeiteten Daten (Art. 15),",
            "Berichtigung unrichtiger Daten (Art. 16),",
            "Löschung Ihrer Daten (Art. 17),",
            "Einschränkung der Verarbeitung (Art. 18),",
            "Datenübertragbarkeit (Art. 20),",
            "Widerspruch gegen die Verarbeitung (Art. 21),",
            "Widerruf einer erteilten Einwilligung mit Wirkung für die Zukunft (Art. 7 Abs. 3),",
            "Beschwerde bei einer Datenschutz-Aufsichtsbehörde, insbesondere in dem Mitgliedstaat Ihres gewöhnlichen Aufenthalts oder Arbeitsplatzes ([Zuständige Aufsichtsbehörde einsetzen]).",
          ],
        },
        {
          heading: "9. Sicherheitsmaßnahmen",
          paragraphs: [
            "Wir verschlüsseln Daten während der Übertragung (TLS/HTTPS), beschränken den Zugriff auf das Admin-Dashboard auf autorisierte Mitarbeitende, speichern Datei-Uploads in einem privaten, nicht öffentlich zugänglichen Speicherbereich und protokollieren administrative Änderungen zu Prüfzwecken.",
          ],
        },
        {
          heading: "10. Kinder",
          paragraphs: [
            "Unsere Website richtet sich an Geschäftskunden und ist nicht für Kinder unter 16 Jahren bestimmt. Wir erheben wissentlich keine Daten von Kindern.",
          ],
        },
        {
          heading: "11. Änderungen dieser Erklärung",
          paragraphs: [
            "Wir können diese Datenschutzerklärung aktualisieren, um Änderungen unserer Praktiken oder rechtlicher Anforderungen widerzuspiegeln. Das Datum „Zuletzt aktualisiert“ oben zeigt die aktuelle Fassung an.",
          ],
        },
      ],
      cookieHeading: "12. Cookies, die wir verwenden",
      cookieIntro:
        "Das Banner speichert Ihre Auswahl in localStorage. Analyse-Cookies können von Yandex Metrika und Google Analytics / Tag Manager gesetzt werden.",
      cookieColumns: {
        name: "Cookie",
        provider: "Anbieter",
        purpose: "Zweck",
        duration: "Dauer",
        category: "Kategorie",
      },
      cookieRows: COOKIE_ROWS_DE,
      manageCookies: "Cookie-Einstellungen verwalten",
      contactHeading: "13. Kontakt für Datenschutzanfragen",
      contactParagraphs: [
        `Für Auskunfts-, Berichtigungs-, Lösch- oder sonstige Anfragen zu Ihren Daten kontaktieren Sie uns bitte unter ${contactEmail} oder [Name des Datenschutzbeauftragten, falls bestellt].`,
      ],
    };
  }

  return {
    eyebrow: "Legal",
    title: "Privacy Policy",
    updated: "Last updated: August 2026",
    intro: [
      "This Privacy Policy explains what personal data METRIC (\"we\", \"us\") processes when you visit this website or use our contact form, and your rights under the General Data Protection Regulation (GDPR) and other applicable laws.",
    ],
    sections: [
      {
        heading: "1. Data controller",
        paragraphs: ["The controller responsible for processing on this website is:"],
        list: [
          "[Full legal company name]",
          "[Registered business address]",
          "[Country / jurisdiction of registration]",
          "[Commercial register number, if applicable]",
          `Email: ${contactEmail}`,
        ],
      },
      {
        heading: "2. EU representative (Art. 27 GDPR)",
        paragraphs: [
          "If METRIC has no establishment in the EU but processes personal data of individuals located in the EU, we appoint an EU representative under Art. 27 GDPR:",
        ],
        list: ["[EU representative name and address, if applicable]"],
      },
      {
        heading: "3. What data we process",
        paragraphs: [
          "Contact form: when you submit our contact form, we process your name, phone number, message, an optional file attachment, the consent checkbox state, and the submission timestamp.",
          "Technical data: on every page load, our hosting provider and security safeguards (e.g. bot/spam protection) automatically process technical data such as IP address, timestamps, and basic request metadata to prevent abuse and keep the site running.",
          "Analytics data: we process usage data (pages visited, clicks, approximate location) through Yandex Metrika and/or Google Analytics or Google Tag Manager.",
        ],
      },
      {
        heading: "4. Legal basis for processing",
        list: [
          "Responding to contact form inquiries: Art. 6(1)(b) GDPR (pre-contractual steps) or Art. 6(1)(f) (legitimate interest in answering inquiries).",
          "Security, fraud and spam prevention (IP processing, rate-limiting, captcha): Art. 6(1)(f) GDPR (legitimate interest in running a secure website).",
          "Analytics cookies (Yandex Metrika, Google Analytics/Tag Manager): Art. 6(1)(f) GDPR (legitimate interest in measuring traffic).",
        ],
      },
      {
        heading: "5. Recipients and processors",
        paragraphs: ["We share data only with service providers that help us run this website:"],
        list: [
          "Supabase, Inc. — database, storage and authentication infrastructure for inquiries and file uploads.",
          "Telegram (Telegram FZ-LLC) — internal notification to our team about new inquiries (name, phone number, message, attachment indicator).",
          "Cloudflare Turnstile or hCaptcha — bot/spam protection for the contact form, when enabled.",
          "Yandex LLC (Yandex Metrika) and Google LLC / Google Ireland Limited (Google Analytics, Google Tag Manager) — website analytics.",
          "[Hosting provider] — website infrastructure hosting.",
        ],
      },
      {
        heading: "6. International data transfers",
        paragraphs: [
          "Some of the providers above process data outside the European Economic Area (e.g. in the US or Russia). Where EU users' data is transferred to a country without an adequacy decision, we rely on appropriate safeguards such as the EU Standard Contractual Clauses or comparable mechanisms with the relevant provider. Details are available on request.",
        ],
      },
      {
        heading: "7. Retention periods",
        list: [
          "Contact inquiries (metric_leads): kept for as long as needed to handle your request, generally [12 months] after the last interaction, after which the record and any attached file are deleted.",
          "Analytics data: retained per Yandex Metrika / Google Analytics retention settings.",
          "Admin accounts and audit logs: kept for the duration of the working relationship and as required by applicable legal retention obligations.",
        ],
      },
      {
        heading: "8. Your rights",
        paragraphs: ["Under the GDPR, you have the right to:"],
        list: [
          "Access the data we hold about you (Art. 15),",
          "Rectify inaccurate data (Art. 16),",
          "Request erasure of your data (Art. 17),",
          "Restrict processing (Art. 18),",
          "Receive your data in a portable format (Art. 20),",
          "Object to processing (Art. 21),",
          "Withdraw any consent you've given, with future effect (Art. 7(3)),",
          "Lodge a complaint with a data protection supervisory authority, in particular in the EU member state of your habitual residence or workplace ([insert competent supervisory authority]).",
        ],
      },
      {
        heading: "9. Security measures",
        paragraphs: [
          "We encrypt data in transit (TLS/HTTPS), restrict admin dashboard access to authorized staff, store file uploads in a private, non-public storage bucket, and log administrative changes for audit purposes.",
        ],
      },
      {
        heading: "10. Children",
        paragraphs: [
          "Our website is directed at business customers and is not intended for children under 16. We do not knowingly collect data from children.",
        ],
      },
      {
        heading: "11. Changes to this policy",
        paragraphs: [
          "We may update this Privacy Policy to reflect changes in our practices or legal requirements. The \"Last updated\" date above indicates the current version.",
        ],
      },
    ],
    cookieHeading: "12. Cookies we use",
    cookieIntro:
      "The banner stores your choice in localStorage. Analytics cookies may be set by Yandex Metrika and Google Analytics / Tag Manager.",
    cookieColumns: {
      name: "Cookie",
      provider: "Provider",
      purpose: "Purpose",
      duration: "Duration",
      category: "Category",
    },
    cookieRows: COOKIE_ROWS_EN,
    manageCookies: "Manage cookie preferences",
    contactHeading: "13. Contact for privacy requests",
    contactParagraphs: [
      `For access, correction, deletion, or other requests about your data, please contact us at ${contactEmail} or [Data Protection Officer name, if appointed].`,
    ],
  };
}

export async function PrivacyPolicyView({ locale }: { locale: Locale }) {
  const copy = buildCopy(locale, SITE_CONFIG.email);

  return (
    <SiteLayout locale={locale} headerVariant="compact">
      <div className="metric-legal privacy-policy bg-white py-16 md:py-24">
        <PageContainer>
          <div className="metric-legal__inner privacy-policy__inner">
            <p className="metric-legal__eyebrow">{copy.eyebrow}</p>
            <h1 className="metric-legal__title privacy-policy__title font-display text-foreground">
              {copy.title}
            </h1>
            <p className="privacy-policy__updated">{copy.updated}</p>

            {copy.intro.map((p) => (
              <p key={p} className="privacy-policy__lead">
                {p}
              </p>
            ))}

            {copy.sections.map((section) => (
              <section key={section.heading} className="privacy-policy__section">
                <h2 className="privacy-policy__heading">{section.heading}</h2>
                {section.paragraphs?.map((p) => (
                  <p key={p} className="privacy-policy__paragraph">
                    {p}
                  </p>
                ))}
                {section.list ? (
                  <ul className="privacy-policy__list">
                    {section.list.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                ) : null}
              </section>
            ))}

            <section className="privacy-policy__section" id="cookies">
              <h2 className="privacy-policy__heading">{copy.cookieHeading}</h2>
              <p className="privacy-policy__paragraph">{copy.cookieIntro}</p>
              <div className="privacy-policy__table-wrap">
                <table className="privacy-policy__table">
                  <thead>
                    <tr>
                      <th>{copy.cookieColumns.name}</th>
                      <th>{copy.cookieColumns.provider}</th>
                      <th>{copy.cookieColumns.purpose}</th>
                      <th>{copy.cookieColumns.duration}</th>
                      <th>{copy.cookieColumns.category}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {copy.cookieRows.map((row) => (
                      <tr key={row.name}>
                        <td data-label={copy.cookieColumns.name}>{row.name}</td>
                        <td data-label={copy.cookieColumns.provider}>{row.provider}</td>
                        <td data-label={copy.cookieColumns.purpose}>{row.purpose}</td>
                        <td data-label={copy.cookieColumns.duration}>{row.duration}</td>
                        <td data-label={copy.cookieColumns.category}>{row.category}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <CookiePreferencesButton label={copy.manageCookies} />
            </section>

            <section className="privacy-policy__section">
              <h2 className="privacy-policy__heading">{copy.contactHeading}</h2>
              {copy.contactParagraphs.map((p) => (
                <p key={p} className="privacy-policy__paragraph">
                  {p}
                </p>
              ))}
            </section>
          </div>
        </PageContainer>
      </div>
    </SiteLayout>
  );
}
