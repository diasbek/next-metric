import { redirect } from "next/navigation";

/** Agency admin removed — public /agency redirects to home; CMS unused. */
export default async function AdminAgencyRedirect() {
  redirect("/admin/home/");
}
