import { config } from "dotenv";
config({ path: ".env.local" });

import { createClient } from "@supabase/supabase-js";
import { ruContent } from "@/i18n/locales/ru";
import { uzContent } from "@/i18n/locales/uz";
import { enContent } from "@/i18n/locales/en";
import type { Project } from "@/data/projects";
import type { SiteContent } from "@/i18n/types";

type Locale = "ru" | "uz" | "en";

const locales: Record<Locale, SiteContent> = {
  ru: ruContent,
  uz: uzContent,
  en: enContent,
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
  for (const locale of Object.keys(locales) as Locale[]) {
    for (const project of locales[locale].projects) {
      const entry = bySlug.get(project.slug) ?? {};
      entry[locale] = project;
      bySlug.set(project.slug, entry);
    }
  }

  let order = 0;
  for (const [slug, variants] of bySlug) {
    const base = variants.ru ?? Object.values(variants)[0]!;
    const { data: project, error } = await supabase
      .from("projects")
      .upsert(
        {
          slug,
          status: "published",
          sort_order: order++,
          sphere: base.sphere,
          featured: Boolean(base.featured),
          cover_image: base.image,
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
      const { error: trError } = await supabase.from("project_translations").upsert(
        {
          project_id: project.id,
          locale,
          title: p.title,
          description: p.description,
          tags: p.tags,
          case_year: p.caseStudy?.year ?? null,
          case_task: p.caseStudy?.task ?? null,
          case_solution: p.caseStudy?.solution ?? null,
        },
        { onConflict: "project_id,locale" },
      );
      if (trError) throw new Error(`project tr ${slug}/${locale}: ${trError.message}`);
    }

    await supabase.from("project_media").delete().eq("project_id", project.id);

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
          .from("project_blocks")
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
          block.images.forEach((url, i) => {
            media.push({
              project_id: project.id,
              kind: "gallery",
              url,
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
      const { error: mediaError } = await supabase.from("project_media").insert(media);
      if (mediaError) throw new Error(`project media ${slug}: ${mediaError.message}`);
    }
  }

  console.log(`projects: ${bySlug.size}`);
}

async function seedServices(supabase: ReturnType<typeof admin>) {
  const keys = locales.ru.services.map((s) => s.id);
  let order = 0;
  for (const key of keys) {
    const { data: service, error } = await supabase
      .from("services")
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
      const { error: trError } = await supabase.from("service_translations").upsert(
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
  await supabase.from("faq_translations").delete().neq("locale", "");
  await supabase.from("faq_items").delete().neq("id", "00000000-0000-0000-0000-000000000000");

  for (let i = 0; i < locales.ru.faq.length; i++) {
    const { data: item, error } = await supabase
      .from("faq_items")
      .insert({ sort_order: i, status: "published" })
      .select("id")
      .single();
    if (error || !item) throw new Error(`faq ${i}: ${error?.message}`);

    for (const locale of Object.keys(locales) as Locale[]) {
      const faq = locales[locale].faq[i];
      if (!faq) continue;
      const { error: trError } = await supabase.from("faq_translations").insert({
        faq_id: item.id,
        locale,
        question: faq.question,
        answer: faq.answer,
      });
      if (trError) throw new Error(`faq tr ${i}/${locale}: ${trError.message}`);
    }
  }
  console.log(`faq: ${locales.ru.faq.length}`);
}

async function seedProcess(supabase: ReturnType<typeof admin>) {
  await supabase.from("process_step_translations").delete().neq("locale", "");
  await supabase
    .from("process_steps")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");

  for (let i = 0; i < locales.ru.processSteps.length; i++) {
    const ru = locales.ru.processSteps[i];
    const { data: step, error } = await supabase
      .from("process_steps")
      .insert({ step_number: ru.number, sort_order: i, status: "published" })
      .select("id")
      .single();
    if (error || !step) throw new Error(`process ${i}: ${error?.message}`);

    for (const locale of Object.keys(locales) as Locale[]) {
      const item = locales[locale].processSteps[i];
      if (!item) continue;
      const { error: trError } = await supabase.from("process_step_translations").insert({
        step_id: step.id,
        locale,
        title: item.title,
        description: item.description,
      });
      if (trError) throw new Error(`process tr ${i}/${locale}: ${trError.message}`);
    }
  }
  console.log(`process: ${locales.ru.processSteps.length}`);
}

async function seedBenefits(supabase: ReturnType<typeof admin>) {
  await supabase.from("benefit_translations").delete().neq("locale", "");
  await supabase
    .from("benefits")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");

  for (let i = 0; i < locales.ru.benefits.length; i++) {
    const { data: benefit, error } = await supabase
      .from("benefits")
      .insert({ sort_order: i, status: "published" })
      .select("id")
      .single();
    if (error || !benefit) throw new Error(`benefit ${i}: ${error?.message}`);

    for (const locale of Object.keys(locales) as Locale[]) {
      const label = locales[locale].benefits[i];
      if (!label) continue;
      const { error: trError } = await supabase.from("benefit_translations").insert({
        benefit_id: benefit.id,
        locale,
        label,
      });
      if (trError) throw new Error(`benefit tr ${i}/${locale}: ${trError.message}`);
    }
  }
  console.log(`benefits: ${locales.ru.benefits.length}`);
}

async function seedTeam(supabase: ReturnType<typeof admin>) {
  await supabase.from("team_member_translations").delete().neq("locale", "");
  await supabase
    .from("team_members")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");

  const director = locales.ru.agency.director;
  const { data: dir, error: dirError } = await supabase
    .from("team_members")
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
    await supabase.from("team_member_translations").insert({
      member_id: dir.id,
      locale,
      name: person.name,
      role: person.role,
    });
  }

  for (let i = 0; i < locales.ru.agency.team.length; i++) {
    const ru = locales.ru.agency.team[i];
    const { data: member, error } = await supabase
      .from("team_members")
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
      await supabase.from("team_member_translations").insert({
        member_id: member.id,
        locale,
        name: person.name,
        role: person.role,
      });
    }
  }
  console.log(`team: ${1 + locales.ru.agency.team.length}`);
}

async function seedTestimonials(supabase: ReturnType<typeof admin>) {
  await supabase.from("testimonial_translations").delete().neq("locale", "");
  await supabase
    .from("testimonials")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");

  for (let i = 0; i < locales.ru.agency.testimonials.length; i++) {
    const ru = locales.ru.agency.testimonials[i];
    const { data: item, error } = await supabase
      .from("testimonials")
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
      await supabase.from("testimonial_translations").insert({
        testimonial_id: item.id,
        locale,
        role: t.role,
        quote: t.quote,
      });
    }
  }
  console.log(`testimonials: ${locales.ru.agency.testimonials.length}`);
}

async function seedAgency(supabase: ReturnType<typeof admin>) {
  const { error } = await supabase.from("agency_content").upsert({
    id: 1,
    founded_year: locales.ru.agency.foundedYear,
  });
  if (error) throw new Error(`agency_content: ${error.message}`);

  for (const locale of Object.keys(locales) as Locale[]) {
    const agency = locales[locale].agency;
    const lines = agency.about.titleLines ?? [agency.about.title];
    const { error: trError } = await supabase.from("agency_translations").upsert({
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

async function seedHomeWhyUs(supabase: ReturnType<typeof admin>) {
  for (const locale of Object.keys(locales) as Locale[]) {
    const lines = locales[locale].sections.whyUsTitleLines;
    const { error } = await supabase.from("home_translations").upsert({
      locale,
      why_us_title_line_1: lines[0] ?? "",
      why_us_title_line_2: lines[1] ?? "",
      updated_at: new Date().toISOString(),
    });
    if (error) throw new Error(`home_translations ${locale}: ${error.message}`);
  }
  console.log("home why-us titles: ok");
}

async function seedSettingsAndSeo(supabase: ReturnType<typeof admin>) {
  const site = locales.ru.site;
  const { error } = await supabase.from("site_settings").upsert({
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
      .from("site_settings_translations")
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
      const { error: seoError } = await supabase.from("page_seo").upsert({
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
  await seedProcess(supabase);
  await seedBenefits(supabase);
  await seedHomeWhyUs(supabase);
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
