import { redirect } from "next/navigation";

/** Soft-deprecated: benefits / why-us are not on the Metric homepage. */
export default async function RedirectBenefits() {
  redirect("/admin/metric-home/");
}
