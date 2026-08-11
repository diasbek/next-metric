import { redirect } from "next/navigation";

/** FAQ Q&A lives under Metric Home. */
export default async function RedirectFaq({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const params = await searchParams;
  const edit = params.edit ? `&edit=${encodeURIComponent(params.edit)}` : "";
  redirect(`/admin/metric-home/?section=faq${edit}`);
}
