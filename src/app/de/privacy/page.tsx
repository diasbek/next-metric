import type { Metadata } from "next";
import { PrivacyPolicyView } from "@/views/PrivacyPolicyView";

export const metadata: Metadata = {
  title: "Datenschutz — METRIC",
  description: "Datenschutz bei METRIC für Kontakt und Analytics sowie Ihre DSGVO-Rechte.",
};

export default function DePrivacyPage() {
  return <PrivacyPolicyView locale="de" />;
}
