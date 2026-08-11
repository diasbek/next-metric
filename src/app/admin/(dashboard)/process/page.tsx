import { redirect } from "next/navigation";

/** Soft-deprecated: process steps are not on the Metric homepage. */
export default async function RedirectProcess() {
  redirect("/admin/metric-home/");
}
