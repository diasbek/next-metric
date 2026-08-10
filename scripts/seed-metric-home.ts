import { config } from "dotenv";
config({ path: ".env.local" });

import { createClient } from "@supabase/supabase-js";
import { getMetricHome, toMetricHomePayload } from "@/data/metric-home";
import { faqItems } from "@/data/faq";
import { deContent } from "@/i18n/locales/de";
import { enContent } from "@/i18n/locales/en";

type Locale = "en" | "de";

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

async function seedMetricHome(supabase: ReturnType<typeof admin>) {
  const { error: homeError } = await supabase.from("metric_home").upsert({
    id: 1,
    status: "published",
    updated_at: new Date().toISOString(),
  });
  if (homeError) throw new Error(`metric_home: ${homeError.message}`);

  for (const locale of ["en", "de"] as const) {
    const payload = toMetricHomePayload(getMetricHome(locale));
    const { error } = await supabase.from("metric_home_translations").upsert({
      locale,
      payload,
      updated_at: new Date().toISOString(),
    });
    if (error) throw new Error(`metric_home_translations ${locale}: ${error.message}`);
  }

  console.log("metric_home: published + en/de payloads seeded");
}

async function seedFaqIfEmpty(supabase: ReturnType<typeof admin>) {
  const { count, error: countError } = await supabase
    .from("metric_faq_items")
    .select("id", { count: "exact", head: true });
  if (countError) throw new Error(`faq count: ${countError.message}`);
  if ((count ?? 0) > 0) {
    console.log(`metric_faq: skipped (already has ${count} items)`);
    return;
  }

  const locales: Record<Locale, typeof enContent.faq> = {
    en: enContent.faq.length ? enContent.faq : faqItems,
    de: deContent.faq.length ? deContent.faq : faqItems,
  };

  for (let i = 0; i < locales.en.length; i++) {
    const { data: item, error } = await supabase
      .from("metric_faq_items")
      .insert({ sort_order: i, status: "published" })
      .select("id")
      .single();
    if (error || !item) throw new Error(`faq ${i}: ${error?.message}`);

    for (const locale of ["en", "de"] as const) {
      const faq = locales[locale][i] ?? locales.en[i];
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

  console.log(`metric_faq: seeded ${locales.en.length} items`);
}

async function main() {
  const supabase = admin();
  await seedMetricHome(supabase);
  await seedFaqIfEmpty(supabase);
  console.log("seed:metric complete");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
