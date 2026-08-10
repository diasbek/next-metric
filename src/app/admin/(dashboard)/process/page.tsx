import { redirect } from "next/navigation";

export default async function RedirectProcess({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const params = await searchParams;
  const edit = params.edit ? `&edit=${encodeURIComponent(params.edit)}` : "";
  redirect(`/admin/home/?section=process${edit}`);
}
