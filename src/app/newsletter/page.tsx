import type { Metadata } from "next";
import { LegalPageView } from "@/views/LegalPageView";

export const metadata: Metadata = {
  title: "Newsletter — METRIC",
  description: "METRIC newsletter for Amazon listing design updates.",
};

export default function NewsletterPage() {
  return <LegalPageView locale="en" page="newsletter" />;
}
