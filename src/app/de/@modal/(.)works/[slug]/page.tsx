import { CaseDetailModalPage } from "@/components/molecules/CaseDetailModalPage";

export default async function InterceptedWorkCaseModalDe({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <CaseDetailModalPage locale="de" slug={slug} />;
}
