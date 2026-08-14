import type { Metadata } from "next";
import { getLegalPageMetadata } from "@/i18n/metadata";
import { LegalPageView } from "@/views/LegalPageView";

const thinPageRobots: Metadata["robots"] = {
  index: false,
  follow: false,
};

export function generateMetadata(): Metadata {
  return getLegalPageMetadata({
    locale: "en",
    path: "/careers/",
    title: "Careers — METRIC",
    description: "Join the METRIC Amazon design team.",
    robots: thinPageRobots,
  });
}

export default function CareersPage() {
  return <LegalPageView locale="en" page="careers" />;
}
