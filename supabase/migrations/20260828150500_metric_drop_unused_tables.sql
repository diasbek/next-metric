-- Drop unused empty CMS tables (never read by the app).

drop table if exists public.metric_process_step_translations cascade;
drop table if exists public.metric_process_steps cascade;
drop table if exists public.metric_benefit_translations cascade;
drop table if exists public.metric_benefits cascade;
