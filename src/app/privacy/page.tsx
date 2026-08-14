import type { Metadata } from "next";
import { getLegalPageMetadata } from "@/i18n/metadata";
import { PrivacyPolicyView } from "@/views/PrivacyPolicyView";

export function generateMetadata(): Metadata {
  return getLegalPageMetadata({
    locale: "en",
    path: "/privacy/",
    title: "Privacy Policy — METRIC",
    description:
      "How METRIC handles privacy for contact and analytics, and your GDPR rights.",
  });
}

export default function PrivacyPage() {
  return <PrivacyPolicyView locale="en" />;
}
