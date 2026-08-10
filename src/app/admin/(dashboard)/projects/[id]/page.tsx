import { redirect } from "next/navigation";

export default async function AdminProjectIdRedirect({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/admin/works/${id}/`);
}
