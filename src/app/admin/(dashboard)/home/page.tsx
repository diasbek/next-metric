import { redirect } from "next/navigation";

/** Legacy process/benefits homepage path — Metric home is `/admin/metric-home/`. */
export default async function AdminHomePageEditor() {
  redirect("/admin/metric-home/");
}
