import type { Metadata } from "next";
import { LegalPageView } from "@/views/LegalPageView";

export const metadata: Metadata = {
  title: "Careers — METRIC",
  description: "Join the METRIC Amazon design team.",
};

export default function CareersPage() {
  return <LegalPageView locale="en" page="careers" />;
}
