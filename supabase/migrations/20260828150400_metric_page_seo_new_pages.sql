-- Seed page SEO rows for restored indexable marketing pages.

insert into public.metric_page_seo (locale, page_key, title, description, keywords, og_image, noindex)
values
  ('en', 'services', 'Services — METRIC', 'Amazon listing images, A+ Content, and storefront design services from METRIC.', 'Amazon listing design, A+ Content, Amazon services', null, false),
  ('de', 'services', 'Leistungen — METRIC', 'Amazon Listing-Bilder, A+ Content und Storefront-Design von METRIC.', 'Amazon Listing Design, A+ Content, Amazon Leistungen', null, false),
  ('en', 'agency', 'Agency — METRIC', 'METRIC is an Amazon design studio focused on conversion-ready listing visuals.', 'Amazon design agency, listing studio', null, false),
  ('de', 'agency', 'Agentur — METRIC', 'METRIC ist ein Amazon-Designstudio für conversionstarke Listing-Visuals.', 'Amazon Design Agentur, Listing Studio', null, false),
  ('en', 'contacts', 'Contact — METRIC', 'Start a project with METRIC — Amazon listing design and A+ Content.', 'contact METRIC, Amazon design brief', null, false),
  ('de', 'contacts', 'Kontakt — METRIC', 'Starten Sie ein Projekt mit METRIC — Amazon Listing Design und A+ Content.', 'Kontakt METRIC, Amazon Design Brief', null, false),
  ('en', 'imprint', 'Imprint — METRIC', 'Legal imprint and company details for METRIC.', 'imprint, legal notice', null, false),
  ('de', 'imprint', 'Impressum — METRIC', 'Impressum und Firmendaten von METRIC.', 'Impressum, Anbieterkennzeichnung', null, false)
on conflict (locale, page_key) do update set
  title = excluded.title,
  description = excluded.description,
  keywords = excluded.keywords,
  noindex = excluded.noindex;
