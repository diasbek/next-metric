import { redirect } from "next/navigation";

export default async function AdminProjectsRedirect() {
  redirect("/admin/works/");
}
