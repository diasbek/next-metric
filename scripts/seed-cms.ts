import { config } from "dotenv";
config({ path: ".env.local" });

import { createClient } from "@supabase/supabase-js";
import { enContent } from "@/i18n/locales/en";
import { deContent } from "@/i18n/locales/de";
import { projects as catalogProjects } from "@/data/projects";
import type { Project } from "@/data/projects";
import type { SiteContent } from "@/i18n/types";

type Locale = "en" | "de";

const locales: Record<Locale, SiteContent> = {
  en: enContent,
  de: deContent,
};

/** Case studies are seeded from the static catalog into CMS (not from SiteContent). */
const projectLocales: Record<Locale, Project[]> = {
  en: catalogProjects,
  de: catalogProjects,
};

function requireEnv(...keys: string[]) {
  for (const key of keys) {
    const value = process.env[key]?.trim();
    if (value) return value;
  }
  throw new Error(`Missing env: ${keys.join(" | ")}`);
}

function admin() {
  return createClient(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_URL"),
    requireEnv("SUPABASE_SECRET_KEY", "SUPABASE_API_KEY"),
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}

async function seedProjects(supabase: ReturnType<typeof admin>) {
  const bySlug = new Map<string, Partial<Record<Locale, Project>>>();
  for (const locale of Object.keys(projectLocales) as Locale[]) {
    for (const project of projectLocales[locale]) {
      const entry = bySlug.get(project.slug) ?? {};
      entry[locale] = project;
      bySlug.set(project.slug, entry);
    }
  }

  let order = 0;
  for (const [slug, variants] of bySlug) {
    const base = variants.en ?? Object.values(variants)[0]!;

    const { data: existing } = await supabase
      .from("metric_projects")
      .select("id, cover_image, og_image")
      .eq("slug", slug)
      .maybeSingle();

    const { data: existingMedia } = existing
      ? await supabase
          .from("metric_project_media")
          .select("url")
          .eq("project_id", existing.id)
      : { data: [] as Array<{ url: string }> };

    const hasStorageMedia = Boolean(
      (existing?.cover_image && isStorageMediaUrl(existing.cover_image)) ||
        (existing?.og_image && isStorageMediaUrl(existing.og_image)) ||
        (existingMedia ?? []).some((m) => isStorageMediaUrl(m.url)),
    );

    const coverImage =
      hasStorageMedia && existing?.cover_image
        ? existing.cover_image
        : base.image;
    const ogImage =
      hasStorageMedia && existing?.og_image
        ? existing.og_image
        : (base.seo?.ogImage ?? "");

    const { data: project, error } = await supabase
      .from("metric_projects")
      .upsert(
        {
          slug,
          status: "published",
          sort_order: order++,
          sphere: base.sphere,
          featured: Boolean(base.featured),
          cover_image: coverImage,
          og_image: ogImage,
          seo_indexable: base.seo?.indexable !== false,
          published_at: new Date().toISOString(),
        },
        { onConflict: "slug" },
      )
      .select("id")
      .single();

    if (error || !project) {
      throw new Error(`project ${slug}: ${error?.message}`);
    }

    for (const locale of Object.keys(variants) as Locale[]) {
      const p = variants[locale]!;
      const { error: trError } = await supabase.from("metric_project_translations").upsert(
        {
          project_id: project.id,
          locale,
          title: p.title,
          description: p.description,
          tags: p.tags,
          case_year: p.caseStudy?.year ?? null,
          case_task: p.caseStudy?.task ?? null,
          case_solution: p.caseStudy?.solution ?? null,
          author: p.author ?? "",
          role: p.role ?? "",
          quote: p.quote ?? "",
          meta_title: p.seo?.metaTitle ?? "",
          meta_description: p.seo?.metaDescription ?? "",
          keywords: p.seo?.keywords ?? "",
        },
        { onConflict: "project_id,locale" },
      );
      if (trError) throw new Error(`project tr ${slug}/${locale}: ${trError.message}`);
    }

    if (hasStorageMedia) {
      console.log(`projects: ${slug} — metadata only (Storage media preserved)`);
      continue;
    }

    await supabase.from("metric_project_media").delete().eq("project_id", project.id);
    await supabase.from("metric_project_blocks").delete().eq("project_id", project.id);

    const media: Array<{
      project_id: string;
      kind: string;
      url: string;
      sort_order: number;
      alt: string;
      block_id?: string;
    }> = [];

    if (base.image) {
      media.push({
        project_id: project.id,
        kind: "cover",
        url: base.image,
        sort_order: 0,
        alt: base.title,
      });
    }

    const cs = base.caseStudy;
    if (cs) {
      if (cs.heroImage) {
        media.push({
          project_id: project.id,
          kind: "hero",
          url: cs.heroImage,
          sort_order: 0,
          alt: base.title,
        });
      }

      let sort = 0;
      for (const block of cs.blocks) {
        const { data: blockRow, error: blockError } = await supabase
          .from("metric_project_blocks")
          .insert({
            project_id: project.id,
            type: block.type,
            sort_order: sort++,
            youtube_url: block.type === "youtube" ? block.youtubeUrl : null,
          })
          .select("id")
          .single();
        if (blockError || !blockRow) {
          throw new Error(`project block ${slug}: ${blockError?.message}`);
        }

        if (block.type === "gallery") {
          block.images.forEach((image, i) => {
            media.push({
              project_id: project.id,
              kind: "gallery",
              url: image.url,
              sort_order: i,
              alt: `${base.title} ${i + 1}`,
              block_id: blockRow.id,
            });
          });
        } else if (block.type === "before_after") {
          if (block.beforeImage) {
            media.push({
              project_id: project.id,
              kind: "before",
              url: block.beforeImage,
              sort_order: 0,
              alt: `${base.title} before`,
              block_id: blockRow.id,
            });
          }
          if (block.afterImage) {
            media.push({
              project_id: project.id,
              kind: "after",
              url: block.afterImage,
              sort_order: 0,
              alt: `${base.title} after`,
              block_id: blockRow.id,
            });
          }
        }
      }
    }

    if (media.length) {
      const { error: mediaError } = await supabase.from("metric_project_media").insert(media);
      if (mediaError) throw new Error(`project media ${slug}: ${mediaError.message}`);
    }
  }

  console.log(`projects: ${bySlug.size}`);
}

function isStorageMediaUrl(url: string): boolean {
  return url.includes("/storage/v1/object/public/metric-media/");
}

async function seedServices(supabase: ReturnType<typeof admin>) {
  const keys = locales.en.services.map((s) => s.id);
  let order = 0;
  for (const key of keys) {
    const { data: service, error } = await supabase
      .from("metric_services")
      .upsert(
        { service_key: key, sort_order: order++, status: "published" },
        { onConflict: "service_key" },
      )
      .select("id")
      .single();
    if (error || !service) throw new Error(`service ${key}: ${error?.message}`);

    for (const locale of Object.keys(locales) as Locale[]) {
      const s = locales[locale].services.find((item) => item.id === key);
      if (!s) continue;
      const { error: trError } = await supabase.from("metric_service_translations").upsert(
        {
          service_id: service.id,
          locale,
          title: s.title,
          short_description: s.shortDescription,
          full_description: s.fullDescription,
          price: s.price,
          duration: s.duration,
        },
        { onConflict: "service_id,locale" },
      );
      if (trError) throw new Error(`service tr ${key}/${locale}: ${trError.message}`);
    }
  }
  console.log(`services: ${keys.length}`);
}

async function seedFaq(supabase: ReturnType<typeof admin>) {
  await supabase.from("metric_faq_translations").delete().neq("locale", "");
  await supabase.from("metric_faq_items").delete().neq("id", "00000000-0000-0000-0000-000000000000");

  for (let i = 0; i < locales.en.faq.length; i++) {
    const { data: item, error } = await supabase
      .from("metric_faq_items")
      .insert({ sort_order: i, status: "published" })
      .select("id")
      .single();
    if (error || !item) throw new Error(`faq ${i}: ${error?.message}`);

    for (const locale of Object.keys(locales) as Locale[]) {
      const faq = locales[locale].faq[i];
      if (!faq) continue;
      const { error: trError } = await supabase.from("metric_faq_translations").insert({
        faq_id: item.id,
        locale,
        question: faq.question,
        answer: faq.answer,
      });
      if (trError) throw new Error(`faq tr ${i}/${locale}: ${trError.message}`);
    }
  }
  console.log(`faq: ${locales.en.faq.length}`);
}

async function seedTeam(supabase: ReturnType<typeof admin>) {
  await supabase.from("metric_team_member_translations").delete().neq("locale", "");
  await supabase
    .from("metric_team_members")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");

  const director = locales.en.agency.director;
  const { data: dir, error: dirError } = await supabase
    .from("metric_team_members")
    .insert({
      sort_order: 0,
      image: director.image,
      is_director: true,
      status: "published",
    })
    .select("id")
    .single();
  if (dirError || !dir) throw new Error(`director: ${dirError?.message}`);

  for (const locale of Object.keys(locales) as Locale[]) {
    const person = locales[locale].agency.director;
    await supabase.from("metric_team_member_translations").insert({
      member_id: dir.id,
      locale,
      name: person.name,
      role: person.role,
    });
  }

  for (let i = 0; i < locales.en.agency.team.length; i++) {
    const ru = locales.en.agency.team[i];
    const { data: member, error } = await supabase
      .from("metric_team_members")
      .insert({
        sort_order: i + 1,
        image: ru.image,
        is_director: false,
        status: "published",
      })
      .select("id")
      .single();
    if (error || !member) throw new Error(`team ${i}: ${error?.message}`);

    for (const locale of Object.keys(locales) as Locale[]) {
      const person = locales[locale].agency.team[i];
      if (!person) continue;
      await supabase.from("metric_team_member_translations").insert({
        member_id: member.id,
        locale,
        name: person.name,
        role: person.role,
      });
    }
  }
  console.log(`team: ${1 + locales.en.agency.team.length}`);
}

async function seedTestimonials(supabase: ReturnType<typeof admin>) {
  await supabase.from("metric_testimonial_translations").delete().neq("locale", "");
  await supabase
    .from("metric_testimonials")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");

  for (let i = 0; i < locales.en.agency.testimonials.length; i++) {
    const ru = locales.en.agency.testimonials[i];
    const { data: item, error } = await supabase
      .from("metric_testimonials")
      .insert({
        sort_order: i,
        person_image: ru.personImage,
        person_object_position: ru.personObjectPosition ?? null,
        logo_image: ru.logoImage,
        logo_rounded: ru.logoRounded ?? null,
        status: "published",
      })
      .select("id")
      .single();
    if (error || !item) throw new Error(`testimonial ${i}: ${error?.message}`);

    for (const locale of Object.keys(locales) as Locale[]) {
      const t = locales[locale].agency.testimonials[i];
      if (!t) continue;
      await supabase.from("metric_testimonial_translations").insert({
        testimonial_id: item.id,
        locale,
        role: t.role,
        quote: t.quote,
      });
    }
  }
  console.log(`testimonials: ${locales.en.agency.testimonials.length}`);
}

async function seedAgency(supabase: ReturnType<typeof admin>) {
  const { error } = await supabase.from("metric_agency_content").upsert({
    id: 1,
    founded_year: locales.en.agency.foundedYear,
  });
  if (error) throw new Error(`agency_content: ${error.message}`);

  for (const locale of Object.keys(locales) as Locale[]) {
    const agency = locales[locale].agency;
    const lines = agency.about.titleLines ?? [agency.about.title];
    const { error: trError } = await supabase.from("metric_agency_translations").upsert({
      locale,
      title: agency.about.title,
      title_line_1: lines[0] ?? "",
      title_line_2: lines[1] ?? "",
      paragraphs: agency.about.paragraphs,
      stats: agency.stats,
    });
    if (trError) throw new Error(`agency tr ${locale}: ${trError.message}`);
  }
  console.log("agency: ok");
}

async function seedSettingsAndSeo(supabase: ReturnType<typeof admin>) {
  const site = locales.en.site;
  const { error } = await supabase.from("metric_site_settings").upsert({
    id: 1,
    phone: site.phone,
    email: process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || "hello@metric.agency",
    telegram_url: site.social.telegram,
    instagram_url: site.social.instagram,
    presentation_url: site.files.presentation,
    brief_url: site.files.brief,
    address_lines: site.address,
  });
  if (error) throw new Error(`site_settings: ${error.message}`);

  for (const locale of Object.keys(locales) as Locale[]) {
    const localSite = locales[locale].site;
    const { error: trError } = await supabase
      .from("metric_site_settings_translations")
      .upsert({
        locale,
        address_lines: localSite.address,
        presentation_url: localSite.files.presentation,
        brief_url: localSite.files.brief,
      });
    if (trError) {
      throw new Error(`site_settings_translations ${locale}: ${trError.message}`);
    }
  }

  for (const locale of Object.keys(locales) as Locale[]) {
    const meta = locales[locale].pageMeta;
    for (const [page_key, value] of Object.entries(meta)) {
      if (page_key === "notFound") continue;
      const { error: seoError } = await supabase.from("metric_page_seo").upsert({
        locale,
        page_key,
        title: value.title,
        description: value.description,
        keywords: value.keywords ?? "",
        og_image: null,
      });
      if (seoError) throw new Error(`seo ${locale}/${page_key}: ${seoError.message}`);
    }
  }
  console.log("settings + seo: ok");
}

async function main() {
  const supabase = admin();
  await seedProjects(supabase);
  await seedServices(supabase);
  await seedFaq(supabase);
  await seedTeam(supabase);
  await seedTestimonials(supabase);
  await seedAgency(supabase);
  await seedSettingsAndSeo(supabase);
  console.log("Seed complete.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
