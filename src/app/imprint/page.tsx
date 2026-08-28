import type { Metadata } from "next";
import { getLegalPageMetadata } from "@/i18n/metadata";
import { getLocalizedBreadcrumbs, getLocalizedPageJsonLd } from "@/i18n/page-seo";
import { localePath } from "@/i18n/paths";
import { JsonLd } from "@/components/seo/JsonLd";
import { ImprintView } from "@/views/ImprintView";

export const metadata: Metadata = getLegalPageMetadata({
  locale: "en",
  path: "/imprint/",
  title: "Imprint — METRIC",
  description: "Legal imprint and company details for METRIC.",
});

export default function ImprintPage() {
  const path = localePath("en", "/imprint/");
  const breadcrumbs = getLocalizedBreadcrumbs("en", [
    "home",
    { name: "Imprint", path },
  ]);

  return (
    <>
      <JsonLd
        data={getLocalizedPageJsonLd("en", {
          title: "Imprint — METRIC",
          description: "Legal imprint and company details for METRIC.",
          path,
          breadcrumbs,
        })}
      />
      <ImprintView locale="en" />
    </>
  );
}
