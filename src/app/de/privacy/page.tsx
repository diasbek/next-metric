import type { Metadata } from "next";
import { getLegalPageMetadata } from "@/i18n/metadata";
import { getLocalizedPageJsonLd } from "@/i18n/page-seo";
import { localePath } from "@/i18n/paths";
import { JsonLd } from "@/components/seo/JsonLd";
import { PrivacyPolicyView } from "@/views/PrivacyPolicyView";

const TITLE = "Datenschutz — METRIC";
const DESCRIPTION =
  "Datenschutz bei METRIC für Kontakt und Analytics sowie Ihre DSGVO-Rechte.";

export function generateMetadata(): Metadata {
  return getLegalPageMetadata({
    locale: "de",
    path: "/privacy/",
    title: TITLE,
    description: DESCRIPTION,
  });
}

export default function DePrivacyPage() {
  const path = localePath("de", "/privacy/");
  return (
    <>
      <JsonLd
        data={getLocalizedPageJsonLd("de", {
          title: TITLE,
          description: DESCRIPTION,
          path,
          breadcrumbs: [
            "home",
            { name: "Datenschutz", path },
          ],
        })}
      />
      <PrivacyPolicyView locale="de" />
    </>
  );
}
