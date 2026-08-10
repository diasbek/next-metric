import type { Metadata } from "next";
import { LegalPageView } from "@/views/LegalPageView";

export const metadata: Metadata = {
  title: "Karriere — METRIC",
  description: "Karriere bei METRIC — Amazon Design Team.",
};

export default function DeCareersPage() {
  return <LegalPageView locale="de" page="careers" />;
}
