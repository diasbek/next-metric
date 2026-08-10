import type { Metadata } from "next";
import { LegalPageView } from "@/views/LegalPageView";

export const metadata: Metadata = {
  title: "Newsletter — METRIC",
  description: "METRIC Newsletter zu Amazon Listing-Design.",
};

export default function DeNewsletterPage() {
  return <LegalPageView locale="de" page="newsletter" />;
}
