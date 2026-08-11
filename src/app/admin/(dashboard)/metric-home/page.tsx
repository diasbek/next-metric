import { redirect } from "next/navigation";

/** Canonical Metric home editor is `/admin/home/`. */
export default async function AdminMetricHomeRedirect({
  searchParams,
}: {
  searchParams: Promise<{ section?: string; saved?: string; edit?: string }>;
}) {
  const params = await searchParams;
  const qs = new URLSearchParams();
  if (params.section) qs.set("section", params.section);
  if (params.saved) qs.set("saved", params.saved);
  if (params.edit) qs.set("edit", params.edit);
  const query = qs.toString();
  redirect(query ? `/admin/home/?${query}` : "/admin/home/");
}
