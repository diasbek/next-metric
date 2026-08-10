import { CaseDetailModalPage } from "@/components/molecules/CaseDetailModalPage";

export default async function InterceptedWorkCaseModal({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <CaseDetailModalPage locale="en" slug={slug} />;
}
