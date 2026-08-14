import type { Metadata } from "next";
import { getLegalPageMetadata } from "@/i18n/metadata";
import { LegalPageView } from "@/views/LegalPageView";

const thinPageRobots: Metadata["robots"] = {
  index: false,
  follow: false,
};

export function generateMetadata(): Metadata {
  return getLegalPageMetadata({
    locale: "de",
    path: "/careers/",
    title: "Karriere — METRIC",
    description: "Karriere bei METRIC — Amazon Design Team.",
    robots: thinPageRobots,
  });
}

export default function DeCareersPage() {
  return <LegalPageView locale="de" page="careers" />;
}
