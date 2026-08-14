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
    path: "/newsletter/",
    title: "Newsletter — METRIC",
    description: "METRIC newsletter for Amazon listing design updates.",
    robots: thinPageRobots,
  });
}

export default function NewsletterPage() {
  return <LegalPageView locale="en" page="newsletter" />;
}
