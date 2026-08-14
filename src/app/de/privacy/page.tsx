import type { Metadata } from "next";
import { getLegalPageMetadata } from "@/i18n/metadata";
import { PrivacyPolicyView } from "@/views/PrivacyPolicyView";

export function generateMetadata(): Metadata {
  return getLegalPageMetadata({
    locale: "de",
    path: "/privacy/",
    title: "Datenschutz — METRIC",
    description:
      "Datenschutz bei METRIC für Kontakt und Analytics sowie Ihre DSGVO-Rechte.",
  });
}

export default function DePrivacyPage() {
  return <PrivacyPolicyView locale="de" />;
}
