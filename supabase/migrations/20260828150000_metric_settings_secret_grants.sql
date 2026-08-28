-- Restrict secret columns on metric_site_settings from anon/authenticated.
-- App reads secrets via service role; public SELECT policy remains for non-secret columns.

revoke select (telegram_bot_token, telegram_webhook_secret, captcha_secret_key)
  on public.metric_site_settings
  from anon, authenticated;
