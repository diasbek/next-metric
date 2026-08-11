import type { Metadata } from "next";
import { PrivacyPolicyView } from "@/views/PrivacyPolicyView";

export const metadata: Metadata = {
  title: "Privacy Policy — METRIC",
  description: "How METRIC handles privacy for contact and analytics, and your GDPR rights.",
};

export default function PrivacyPage() {
  return <PrivacyPolicyView locale="en" />;
}
