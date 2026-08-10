import type { Metadata } from "next";
import { LegalPageView } from "@/views/LegalPageView";

export const metadata: Metadata = {
  title: "Datenschutz — METRIC",
  description: "Datenschutz bei METRIC für Kontakt und Analytics.",
};

export default function DePrivacyPage() {
  return <LegalPageView locale="de" page="privacy" />;
}
