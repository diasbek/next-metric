import type { Metadata } from "next";
import { getLegalPageMetadata } from "@/i18n/metadata";
import { getLocalizedPageJsonLd } from "@/i18n/page-seo";
import { localePath } from "@/i18n/paths";
import { JsonLd } from "@/components/seo/JsonLd";
import { PrivacyPolicyView } from "@/views/PrivacyPolicyView";

const TITLE = "Privacy Policy — METRIC";
const DESCRIPTION =
  "How METRIC handles privacy for contact and analytics, and your GDPR rights.";

export function generateMetadata(): Metadata {
  return getLegalPageMetadata({
    locale: "en",
    path: "/privacy/",
    title: TITLE,
    description: DESCRIPTION,
  });
}

export default function PrivacyPage() {
  const path = localePath("en", "/privacy/");
  return (
    <>
      <JsonLd
        data={getLocalizedPageJsonLd("en", {
          title: TITLE,
          description: DESCRIPTION,
          path,
          breadcrumbs: [
            "home",
            { name: "Privacy Policy", path },
          ],
        })}
      />
      <PrivacyPolicyView locale="en" />
    </>
  );
}
