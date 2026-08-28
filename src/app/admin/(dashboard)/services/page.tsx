import { redirect } from "next/navigation";

/** Services on the live site come from Home CMS payload, not metric_services. */
export default async function AdminServicesRedirect() {
  redirect("/admin/home/?section=services");
}
