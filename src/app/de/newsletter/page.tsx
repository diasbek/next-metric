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
    path: "/newsletter/",
    title: "Newsletter — METRIC",
    description: "METRIC Newsletter zu Amazon Listing-Design.",
    robots: thinPageRobots,
  });
}

export default function DeNewsletterPage() {
  return <LegalPageView locale="de" page="newsletter" />;
}
