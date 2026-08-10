"use client";

import { HardNavForm } from "@/components/admin/HardNavForm";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { SITE_CONFIG } from "@/utils/consts";
import { getPageOgImagePath, type OgPageKey } from "@/utils/og/paths";
import {
  deleteTelegramWebhookAction,
  pingTelegramChatAction,
  registerTelegramWebhookAction,
  saveSettingsAction,
  testTelegramNotifyAction,
} from "@/app/admin/(dashboard)/settings/actions";
import {
  adminBtn,
  adminBtnPrimary,
  adminInput,
} from "@/components/admin/ui/styles";
import { AdminPageHeader } from "@/components/admin/ui/AdminPageHeader";
import { ADMIN_LOCALES, type AdminLocale } from "@/components/admin/ui/locales";
import { formatAdminMessage, useAdminT } from "@/i18n/admin";

type Tab = "integrations" | "seo";

type SeoRow = {
  locale: string;
  page_key: string;
  title: string;
  description: string;
  keywords: string;
};

type SettingsData = {
  phone: string;
  email: string;
  telegram_url: string;
  instagram_url: string;
  presentation_url: string;
  brief_url: string;
  address_lines: string;
  telegram_notify_enabled: boolean;
  telegram_chat_ids: string;
  captcha_provider: string;
  captcha_site_key: string;
  yandex_metrika_id: string;
  yandex_webmaster_verification: string;
  google_analytics_id: string;
  google_tag_manager_id: string;
  google_site_verification: string;
  botTokenConfigured: boolean;
  captchaSecretConfigured: boolean;
  webhookSecretConfigured: boolean;
  webhookSecretPresent: boolean;
};

type Props = {
  settings: SettingsData;
  seo: SeoRow[];
  flash?: {
    saved?: boolean;
    webhook?: string;
    test?: boolean;
    ping?: boolean;
    error?: string;
  };
};

const PAGE_KEYS = [
  { key: "home", labelKey: "pageHome" },
  { key: "agency", labelKey: "pageAgency" },
  { key: "works", labelKey: "pageWorks" },
  { key: "services", labelKey: "pageServices" },
  { key: "contacts", labelKey: "pageContacts" },
] as const;

const fieldset: CSSProperties = {
  border: "1px solid #333",
  padding: 16,
  display: "grid",
  gap: 12,
};

export function SettingsEditor({ settings, seo, flash }: Props) {
  const t = useAdminT();
  const [tab, setTab] = useState<Tab>("integrations");
  const [seoLocale, setSeoLocale] = useState<AdminLocale>("en");
  const [seoPage, setSeoPage] = useState<(typeof PAGE_KEYS)[number]["key"]>("home");
  const [seoDraft, setSeoDraft] = useState(() => {
    const map: Record<
      string,
      { title: string; description: string; keywords: string }
    > = {};
    for (const locale of ADMIN_LOCALES) {
      for (const page of PAGE_KEYS) {
        const row = seo.find(
          (r) => r.locale === locale.code && r.page_key === page.key,
        );
        map[`${locale.code}_${page.key}`] = {
          title: row?.title ?? "",
          description: row?.description ?? "",
          keywords: row?.keywords ?? "",
        };
      }
    }
    return map;
  });

  const currentSeo = seoDraft[`${seoLocale}_${seoPage}`] ?? {
    title: "",
    description: "",
    keywords: "",
  };

  const webhookHint = settings.webhookSecretPresent
    ? `${SITE_CONFIG.url.replace(/\/$/, "")}/api/telegram/webhook/?secret=••••••••`
    : t.settings.connectionNotRegistered;

  const tabs: Array<{ id: Tab; label: string }> = [
    { id: "integrations", label: t.settings.tabIntegrations },
    { id: "seo", label: t.settings.tabSeo },
  ];

  const pageLabel = (key: (typeof PAGE_KEYS)[number]["key"]) => {
    const row = PAGE_KEYS.find((p) => p.key === key);
    return row ? t.settings[row.labelKey] : key;
  };

  const snippetHost = useMemo(() => {
    try {
      return new URL(SITE_CONFIG.url).hostname;
    } catch {
      return "metric.agency";
    }
  }, []);

  const ogPath = getPageOgImagePath(seoLocale, seoPage as OgPageKey);
  const [ogPreviewSrc, setOgPreviewSrc] = useState(ogPath);
  const [ogLoading, setOgLoading] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setOgLoading(true);
      const params = new URLSearchParams();
      if (currentSeo.title.trim()) params.set("title", currentSeo.title.trim());
      if (currentSeo.description.trim()) {
        params.set("description", currentSeo.description.trim());
      }
      const qs = params.toString();
      setOgPreviewSrc(qs ? `${ogPath}?${qs}` : ogPath);
    }, 400);
    return () => window.clearTimeout(timer);
  }, [ogPath, currentSeo.title, currentSeo.description]);

  return (
    <div style={{ width: "100%", maxWidth: 720 }}>
      <AdminPageHeader
        title={t.settings.title}
        description={
          <>
            {t.settings.description} {t.settings.contactsHint}{" "}
            <a href="/admin/contacts/" style={{ color: "#8cf" }}>
              /admin/contacts/
            </a>
            .
          </>
        }
      />

      {flash?.saved ? <p style={{ color: "#6f6" }}>{t.common.saved}.</p> : null}
      {flash?.webhook === "ok" || flash?.webhook === "removed" ? (
        <p style={{ color: "#6f6" }}>
          {flash.webhook === "ok" ? t.flash.webhookOk : t.flash.webhookRemoved}
        </p>
      ) : flash?.webhook ? (
        <p style={{ color: "#6f6" }}>{t.flash.webhookOk}</p>
      ) : null}
      {flash?.test ? <p style={{ color: "#6f6" }}>{t.flash.testSent}</p> : null}
      {flash?.ping ? <p style={{ color: "#6f6" }}>{t.flash.pingSent}</p> : null}
      {flash?.error ? <p style={{ color: "#f66" }}>Error: {flash.error}</p> : null}

      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            style={{
              ...adminBtn,
              background: tab === item.id ? "#fff" : "#1a1a1a",
              color: tab === item.id ? "#000" : "#fff",
              fontWeight: tab === item.id ? 600 : 400,
            }}
          >
            {item.label}
          </button>
        ))}
      </div>

      <HardNavForm action={saveSettingsAction} style={{ display: "grid", gap: 20 }}>
        <div style={{ display: tab === "integrations" ? "grid" : "none", gap: 16 }}>
          <fieldset style={fieldset}>
            <legend>{t.settings.telegramLegend}</legend>
            <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input
                type="checkbox"
                name="telegram_notify_enabled"
                defaultChecked={settings.telegram_notify_enabled}
              />
              {t.settings.telegramEnabled}
            </label>
            <label>
              {t.settings.botToken}
              <input
                name="telegram_bot_token"
                type="password"
                autoComplete="off"
                placeholder={
                  settings.botTokenConfigured
                    ? t.settings.botTokenSaved
                    : t.settings.botTokenPlaceholder
                }
                style={adminInput}
              />
            </label>
            <label>
              {t.settings.chatIds}
              <textarea
                name="telegram_chat_ids"
                defaultValue={settings.telegram_chat_ids}
                rows={4}
                placeholder={t.settings.chatIdsPlaceholder}
                style={adminInput}
              />
            </label>
            <label>
              {t.settings.connectionSecret}
              <input
                name="telegram_webhook_secret"
                type="password"
                autoComplete="off"
                placeholder={
                  settings.webhookSecretConfigured
                    ? t.settings.connectionSecretSaved
                    : t.settings.connectionSecretAuto
                }
                style={adminInput}
              />
            </label>
            <p style={{ color: "#888", fontSize: 13, margin: 0, wordBreak: "break-all" }}>
              {t.settings.connectionUrlLabel} {webhookHint}
            </p>
          </fieldset>

          <fieldset style={fieldset}>
            <legend>{t.settings.formProtection}</legend>
            <label>
              {t.settings.captchaProvider}
              <select
                name="captcha_provider"
                defaultValue={settings.captcha_provider}
                style={adminInput}
              >
                <option value="none">{t.settings.captchaOff}</option>
                <option value="honeypot">{t.settings.captchaSimple}</option>
                <option value="turnstile">{t.settings.captchaCloudflare}</option>
                <option value="hcaptcha">{t.settings.captchaHcaptcha}</option>
              </select>
            </label>
            <label>
              {t.settings.captchaSiteKey}
              <input
                name="captcha_site_key"
                defaultValue={settings.captcha_site_key}
                style={adminInput}
              />
            </label>
            <label>
              {t.settings.captchaSecret}
              <input
                name="captcha_secret_key"
                type="password"
                autoComplete="off"
                placeholder={
                  settings.captchaSecretConfigured
                    ? t.settings.secretSavedPlaceholder
                    : t.settings.captchaSecret
                }
                style={adminInput}
              />
            </label>
          </fieldset>

          <fieldset style={fieldset}>
            <legend>{t.settings.analyticsLegend}</legend>
            <label>
              {t.settings.metrikaId}
              <input
                name="yandex_metrika_id"
                defaultValue={settings.yandex_metrika_id}
                placeholder="12345678"
                style={adminInput}
              />
            </label>
            <label>
              {t.settings.webmasterMeta}
              <input
                name="yandex_webmaster_verification"
                defaultValue={settings.yandex_webmaster_verification}
                placeholder={t.settings.webmasterMetaPlaceholder}
                style={adminInput}
              />
            </label>
            <label>
              {t.settings.gaId}
              <input
                name="google_analytics_id"
                defaultValue={settings.google_analytics_id}
                placeholder="G-XXXXXXXX"
                style={adminInput}
              />
            </label>
            <label>
              {t.settings.gtmId}
              <input
                name="google_tag_manager_id"
                defaultValue={settings.google_tag_manager_id}
                placeholder="GTM-XXXX"
                style={adminInput}
              />
            </label>
            <label>
              {t.settings.googleVerification}
              <input
                name="google_site_verification"
                defaultValue={settings.google_site_verification}
                placeholder={t.settings.googleVerificationPlaceholder}
                style={adminInput}
              />
            </label>
          </fieldset>
        </div>

        <div style={{ display: tab === "seo" ? "grid" : "none", gap: 16 }}>
          {Object.entries(seoDraft).map(([key, value]) => (
            <div key={key}>
              <input type="hidden" name={`${key}_title`} value={value.title} />
              <input type="hidden" name={`${key}_description`} value={value.description} />
              <input type="hidden" name={`${key}_keywords`} value={value.keywords} />
            </div>
          ))}

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {ADMIN_LOCALES.map((l) => (
              <button
                key={l.code}
                type="button"
                onClick={() => setSeoLocale(l.code)}
                style={{
                  ...adminBtn,
                  background: seoLocale === l.code ? "#fff" : "#1a1a1a",
                  color: seoLocale === l.code ? "#000" : "#fff",
                }}
              >
                {l.short}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {PAGE_KEYS.map((page) => (
              <button
                key={page.key}
                type="button"
                onClick={() => setSeoPage(page.key)}
                style={{
                  ...adminBtn,
                  background: seoPage === page.key ? "#2600ff" : "#1a1a1a",
                  borderColor: seoPage === page.key ? "#2600ff" : "#444",
                }}
              >
                {pageLabel(page.key)}
              </button>
            ))}
          </div>

          <div
            style={{
              display: "grid",
              gap: 16,
              gridTemplateColumns: "minmax(0, 1fr)",
            }}
          >
            <div
              style={{
                border: "1px solid #333",
                padding: 16,
                background: "#0c0c0c",
                display: "grid",
                gap: 8,
              }}
            >
              <p style={{ margin: 0, fontSize: 12, color: "#888" }}>
                Превью сниппета в поиске
              </p>
              <p style={{ margin: 0, fontSize: 13, color: "#8ab4f8" }}>
                {snippetHost}
                {seoPage === "home"
                  ? seoLocale === "en"
                    ? "/"
                    : `/${seoLocale}/`
                  : seoLocale === "en"
                    ? `/${seoPage}/`
                    : `/${seoLocale}/${seoPage}/`}
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: 18,
                  color: "#8ab4f8",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {currentSeo.title.trim() || t.settings.seoTitlePlaceholder}
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: 13,
                  color: "#aaa",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {currentSeo.description.trim() || t.settings.seoDescriptionPlaceholder}
              </p>
              <p style={{ margin: 0, fontSize: 11, color: "#666" }}>
                {formatAdminMessage(t.settings.seoCounts, {
                  title: currentSeo.title.length,
                  description: currentSeo.description.length,
                })}
              </p>
            </div>

            <div
              style={{
                border: "1px solid #333",
                padding: 16,
                background: "#0c0c0c",
                display: "grid",
                gap: 10,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                  alignItems: "baseline",
                  flexWrap: "wrap",
                }}
              >
                <p style={{ margin: 0, fontSize: 12, color: "#888" }}>
                  {t.settings.ogLabel}
                </p>
                <a
                  href={ogPreviewSrc}
                  target="_blank"
                  rel="noreferrer"
                  style={{ fontSize: 12, color: "#8cf" }}
                >
                  {ogPath} ↗
                </a>
              </div>
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  maxWidth: 560,
                  aspectRatio: "1200 / 630",
                  background: "#111",
                  border: "1px solid #222",
                  overflow: "hidden",
                }}
              >
                {ogLoading ? (
                  <p
                    style={{
                      margin: 0,
                      position: "absolute",
                      inset: 0,
                      display: "grid",
                      placeItems: "center",
                      fontSize: 12,
                      color: "#666",
                    }}
                  >
                    {t.settings.ogLoading}
                  </p>
                ) : null}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  key={ogPreviewSrc}
                  src={ogPreviewSrc}
                  alt={`OG ${seoLocale}/${seoPage}`}
                  onLoad={() => setOgLoading(false)}
                  onError={() => setOgLoading(false)}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                    opacity: ogLoading ? 0 : 1,
                    transition: "opacity 160ms ease",
                  }}
                />
              </div>
              <p style={{ margin: 0, fontSize: 11, color: "#666" }}>
                {t.settings.ogPreviewHint}
              </p>
            </div>
          </div>

          <label>
            {t.settings.seoTitle} ({seoLocale.toUpperCase()} · {pageLabel(seoPage)})
            <input
              value={currentSeo.title}
              onChange={(e) =>
                setSeoDraft((prev) => ({
                  ...prev,
                  [`${seoLocale}_${seoPage}`]: {
                    ...prev[`${seoLocale}_${seoPage}`],
                    title: e.target.value,
                  },
                }))
              }
              placeholder={t.settings.seoTitlePlaceholder}
              style={adminInput}
            />
          </label>
          <label>
            {t.settings.seoDescription}
            <textarea
              value={currentSeo.description}
              onChange={(e) =>
                setSeoDraft((prev) => ({
                  ...prev,
                  [`${seoLocale}_${seoPage}`]: {
                    ...prev[`${seoLocale}_${seoPage}`],
                    description: e.target.value,
                  },
                }))
              }
              placeholder={t.settings.seoDescriptionPlaceholder}
              rows={3}
              style={{ ...adminInput, resize: "vertical" }}
            />
          </label>
          <label>
            {t.settings.seoKeywords}
            <input
              value={currentSeo.keywords}
              onChange={(e) =>
                setSeoDraft((prev) => ({
                  ...prev,
                  [`${seoLocale}_${seoPage}`]: {
                    ...prev[`${seoLocale}_${seoPage}`],
                    keywords: e.target.value,
                  },
                }))
              }
              placeholder={t.settings.seoKeywordsPlaceholder}
              style={adminInput}
            />
          </label>
          <p style={{ margin: 0, fontSize: 12, color: "#666" }}>
            {t.settings.seoKeywordsHint}
          </p>
        </div>

        {/* Keep integration defaults present when on contacts/seo tabs — fields are above with display:none using defaultValue so they still submit */}

        <button type="submit" style={{ ...adminBtnPrimary, padding: 14 }}>
          {t.settings.save}
        </button>
      </HardNavForm>

      {tab === "integrations" ? (
        <div
          style={{
            marginTop: 24,
            display: "flex",
            flexWrap: "wrap",
            gap: 10,
            borderTop: "1px solid #333",
            paddingTop: 20,
          }}
        >
          <HardNavForm action={registerTelegramWebhookAction}>
            <button type="submit" style={adminBtn}>
              {t.settings.connectNotifications}
            </button>
          </HardNavForm>
          <HardNavForm action={deleteTelegramWebhookAction}>
            <button type="submit" style={adminBtn}>
              {t.settings.disconnectNotifications}
            </button>
          </HardNavForm>
          <HardNavForm action={testTelegramNotifyAction}>
            <button type="submit" style={adminBtn}>
              {t.settings.testNotify}
            </button>
          </HardNavForm>
          <HardNavForm action={pingTelegramChatAction} style={{ display: "flex", gap: 8 }}>
            <input
              name="chat_id"
              placeholder={t.settings.chatIdPlaceholder}
              defaultValue={settings.telegram_chat_ids.split("\n")[0] ?? ""}
              style={{ ...adminInput, marginTop: 0, width: 160 }}
            />
            <button type="submit" style={adminBtn}>
              {t.settings.pingChat}
            </button>
          </HardNavForm>
        </div>
      ) : null}
    </div>
  );
}
