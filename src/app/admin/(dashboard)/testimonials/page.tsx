import { redirect } from "next/navigation";

/** Unused while public /agency redirects to home — testimonials CMS not exposed. */
export default async function AdminTestimonialsRedirect() {
  redirect("/admin/home/");
}
