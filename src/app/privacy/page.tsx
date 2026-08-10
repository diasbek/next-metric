import type { Metadata } from "next";
import { LegalPageView } from "@/views/LegalPageView";

export const metadata: Metadata = {
  title: "Privacy Policy — METRIC",
  description: "How METRIC handles privacy for contact and analytics.",
};

export default function PrivacyPage() {
  return <LegalPageView locale="en" page="privacy" />;
}
