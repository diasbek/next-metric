-- Integrations settings: Telegram bot, captcha, analytics / webmaster
alter table public.site_settings
  add column if not exists telegram_bot_token text not null default '',
  add column if not exists telegram_chat_ids text[] not null default '{}',
  add column if not exists telegram_notify_enabled boolean not null default false,
  add column if not exists telegram_webhook_secret text not null default '',
  add column if not exists captcha_provider text not null default 'none',
  add column if not exists captcha_site_key text not null default '',
  add column if not exists captcha_secret_key text not null default '',
  add column if not exists yandex_metrika_id text not null default '',
  add column if not exists yandex_webmaster_verification text not null default '',
  add column if not exists google_analytics_id text not null default '',
  add column if not exists google_tag_manager_id text not null default '',
  add column if not exists google_site_verification text not null default '';

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'site_settings_captcha_provider_check'
  ) then
    alter table public.site_settings
      add constraint site_settings_captcha_provider_check
      check (captcha_provider in ('none', 'honeypot', 'turnstile', 'hcaptcha'));
  end if;
end $$;
