import { writeFileSync } from "fs";
import { getMetricHome, toMetricHomePayload } from "../src/data/metric-home";
import { faqItems } from "../src/data/faq";

function sqlString(value: string): string {
  return `'${value.replace(/'/g, "''")}'`;
}

const parts: string[] = [];

parts.push(`insert into public.metric_home (id, status)
values (1, 'published')
on conflict (id) do update set status = excluded.status;`);

for (const locale of ["en", "de"] as const) {
  const payload = JSON.stringify(toMetricHomePayload(getMetricHome(locale)));
  parts.push(`insert into public.metric_home_translations (locale, payload, updated_at)
values (${sqlString(locale)}, ${sqlString(payload)}::jsonb, now())
on conflict (locale) do update
  set payload = excluded.payload, updated_at = now();`);
}

faqItems.forEach((item, index) => {
  parts.push(`
do $$
declare
  fid uuid;
begin
  select id into fid
  from public.metric_faq_items
  where sort_order = ${index}
  limit 1;

  if fid is null then
    insert into public.metric_faq_items (sort_order, status)
    values (${index}, 'published')
    returning id into fid;
  end if;

  insert into public.metric_faq_translations (faq_id, locale, question, answer)
  values (fid, 'en', ${sqlString(item.question)}, ${sqlString(item.answer)})
  on conflict (faq_id, locale) do update
    set question = excluded.question, answer = excluded.answer;
end $$;`);
});

const out = parts.join("\n\n");
writeFileSync("/tmp/seed_metric.sql", out);
console.log(`Wrote /tmp/seed_metric.sql (${Buffer.byteLength(out)} bytes)`);
