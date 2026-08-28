import { requirePermission } from "@/lib/cms/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { EMBED } from "@/lib/cms/embeds";
import { TestimonialsEditor } from "@/components/admin/testimonials/TestimonialsEditor";
import {
  ADMIN_LOCALES,
  type TestimonialDraft,
} from "@/components/admin/testimonials/types";
import { AdminPageShell } from "@/components/admin/page-shell/AdminPageShell";
import { getAdminMessages } from "@/i18n/admin/get-admin-messages";
import { getAdminUiLocale } from "@/i18n/admin/get-admin-locale";

function toTestimonialDraft(row: {
  id: string;
  sort_order: number;
  status: string;
  person_image: string;
  person_object_position: string | null;
  logo_image: string;
  logo_rounded: string | null;
  testimonial_translations?: Array<{
    locale: string;
    role: string;
    quote: string;
  }>;
}): TestimonialDraft {
  const translations = Object.fromEntries(
    ADMIN_LOCALES.map((locale) => {
      const tr = row.testimonial_translations?.find(
        (t) => t.locale === locale.code,
      );
      return [
        locale.code,
        {
          locale: locale.code,
          role: tr?.role ?? "",
          quote: tr?.quote ?? "",
        },
      ];
    }),
  ) as TestimonialDraft["translations"];

  return {
    id: row.id,
    sort_order: row.sort_order,
    status: row.status,
    person_image: row.person_image ?? "",
    person_object_position: row.person_object_position ?? "",
    logo_image: row.logo_image ?? "",
    logo_rounded: row.logo_rounded ?? "",
    translations,
  };
}

export default async function AdminTestimonialsPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  await requirePermission("content");
  const t = getAdminMessages(await getAdminUiLocale());
  const params = await searchParams;
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("metric_testimonials")
    .select(`*, ${EMBED.testimonialTranslations}`)
    .order("sort_order");

  const items = (data ?? []).map(toTestimonialDraft);
  const initialEditId =
    params.edit && items.some((item) => item.id === params.edit)
      ? params.edit
      : null;

  return (
    <AdminPageShell
      title={t.pages.testimonials.title}
      publicPath="/agency/"
      description={t.pages.testimonials.description}
      sections={[{ id: "content", label: t.pages.testimonials.title }]}
      activeSection="content"
      basePath="/admin/testimonials/"
    >
      <TestimonialsEditor
        items={items}
        initialEditId={initialEditId}
        embedded
      />
    </AdminPageShell>
  );
}
