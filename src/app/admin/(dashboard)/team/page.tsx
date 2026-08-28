import { redirect } from "next/navigation";

/** Unused while public /agency redirects to home — team CMS not exposed. */
export default async function AdminTeamRedirect() {
  redirect("/admin/home/");
}
