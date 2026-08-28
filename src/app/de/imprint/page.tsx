import type { Metadata } from "next";
import { getLegalPageMetadata } from "@/i18n/metadata";
import { getLocalizedBreadcrumbs, getLocalizedPageJsonLd } from "@/i18n/page-seo";
import { localePath } from "@/i18n/paths";
import { JsonLd } from "@/components/seo/JsonLd";
import { ImprintView } from "@/views/ImprintView";

export const metadata: Metadata = getLegalPageMetadata({
  locale: "de",
  path: "/imprint/",
  title: "Impressum — METRIC",
  description: "Impressum und Firmendaten von METRIC.",
});

export default function ImprintPageDe() {
  const path = localePath("de", "/imprint/");
  const breadcrumbs = getLocalizedBreadcrumbs("de", [
    "home",
    { name: "Impressum", path },
  ]);

  return (
    <>
      <JsonLd
        data={getLocalizedPageJsonLd("de", {
          title: "Impressum — METRIC",
          description: "Impressum und Firmendaten von METRIC.",
          path,
          breadcrumbs,
        })}
      />
      <ImprintView locale="de" />
    </>
  );
}
