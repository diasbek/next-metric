import { redirect } from "next/navigation";

/** Services catalog unused on public site — home services block is under Home. */
export default async function AdminServicesRedirect() {
  redirect("/admin/home/?section=services");
}
