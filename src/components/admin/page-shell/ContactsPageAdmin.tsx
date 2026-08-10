"use client";

import { HardNavForm } from "@/components/admin/HardNavForm";
import { useState, type CSSProperties } from "react";

import { saveContactsAction } from "@/app/admin/(dashboard)/contacts/actions";
import { adminBtnPrimary, adminInput } from "@/components/admin/ui/styles";
import { AdminPageShell } from "@/components/admin/page-shell/AdminPageShell";
import { DocumentField } from "@/components/admin/document-field/DocumentField";
import { ADMIN_LOCALES, type AdminLocale } from "@/components/admin/ui/locales";
import { useAdminT } from "@/i18n/admin";

type LocaleDraft = {
  address_lines: string;
  presentation_url: string;
  brief_url: string;
};

type GlobalContacts = {
  phone: string;
  email: string;
  telegram_url: string;
  instagram_url: string;
};

type Props = {
  contacts: GlobalContacts;
  translations: Record<AdminLocale, LocaleDraft>;
  saved?: boolean;
};

const btn: CSSProperties = {
  padding: "10px 14px",
  cursor: "pointer",
  border: "1px solid #444",
  background: "#1a1a1a",
  color: "#fff",
  fontSize: 13,
};

export function ContactsPageAdmin({ contacts, translations, saved }: Props) {
  const t = useAdminT();
  const [locale, setLocale] = useState<AdminLocale>("en");
  const [draft, setDraft] = useState(translations);
  const current = draft[locale];

  const update = (code: AdminLocale, patch: Partial<LocaleDraft>) => {
    setDraft((prev) => ({
      ...prev,
      [code]: { ...prev[code], ...patch },
    }));
  };

  const copyFromEn = () => {
    if (locale === "en") return;
    setDraft((prev) => ({
      ...prev,
      [locale]: {
        address_lines: prev.en.address_lines,
        presentation_url: prev.en.presentation_url,
        brief_url: prev.en.brief_url,
      },
    }));
  };

  return (
    <AdminPageShell
      title={t.contacts.title}
      publicPath="/contacts/"
      description={t.contacts.description}
      sections={[{ id: "content", label: t.nav.contacts }]}
      activeSection="content"
      basePath="/admin/contacts/"
    >
      {saved ? (
        <p style={{ color: "#6f6", marginTop: 0 }}>{t.common.saved}.</p>
      ) : null}

      <HardNavForm
        action={saveContactsAction}
        encType="multipart/form-data"
        style={{
          display: "grid",
          gap: 18,
          width: "100%",
          border: "1px solid #333",
          padding: 18,
        }}
      >
        {/* Keep inactive locale address lines in the form */}
        {ADMIN_LOCALES.map((item) =>
          item.code === locale ? null : (
            <input
              key={`hidden-addr-${item.code}`}
              type="hidden"
              name={`${item.code}_address_lines`}
              value={draft[item.code].address_lines}
              readOnly
            />
          ),
        )}

        <p style={{ margin: 0, fontSize: 12, color: "#888", letterSpacing: "0.06em" }}>
          {t.common.globalAllLocales.toUpperCase()}
        </p>
        <label style={{ fontSize: 13 }}>
          {t.common.phone}
          <input name="phone" defaultValue={contacts.phone} style={adminInput} />
        </label>
        <label style={{ fontSize: 13 }}>
          {t.common.email}
          <input name="email" defaultValue={contacts.email} style={adminInput} />
        </label>
        <label style={{ fontSize: 13 }}>
          {t.contacts.telegramUrl}
          <input
            name="telegram_url"
            defaultValue={contacts.telegram_url}
            style={adminInput}
          />
        </label>
        <label style={{ fontSize: 13 }}>
          {t.contacts.instagramUrl}
          <input
            name="instagram_url"
            defaultValue={contacts.instagram_url}
            style={adminInput}
          />
        </label>

        <div
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            alignItems: "center",
            borderTop: "1px solid #333",
            paddingTop: 16,
          }}
        >
          <span style={{ fontSize: 12, color: "#888" }}>{t.chrome.language}:</span>
          {ADMIN_LOCALES.map((item) => (
            <button
              key={item.code}
              type="button"
              onClick={() => setLocale(item.code)}
              style={{
                ...btn,
                background: locale === item.code ? "#fff" : "#1a1a1a",
                color: locale === item.code ? "#000" : "#fff",
              }}
            >
              {item.short}
            </button>
          ))}
          {locale !== "en" ? (
            <button type="button" style={btn} onClick={copyFromEn}>
              {t.common.copyFromEn}
            </button>
          ) : null}
        </div>

        <p style={{ margin: 0, fontSize: 12, color: "#888" }}>
          {t.common.localized} · {locale.toUpperCase()} · /
          {locale === "en" ? "" : `${locale}/`}
          contacts/
        </p>

        <label style={{ fontSize: 13 }}>
          {t.contacts.address}
          <textarea
            name={`${locale}_address_lines`}
            value={current.address_lines}
            onChange={(e) => update(locale, { address_lines: e.target.value })}
            rows={4}
            style={adminInput}
          />
        </label>

        {/* All locales stay mounted so pending file inputs survive tab switches */}
        {ADMIN_LOCALES.map((item) => (
          <div
            key={`docs-${item.code}`}
            style={{
              display: locale === item.code ? "grid" : "none",
              gap: 18,
            }}
            aria-hidden={locale !== item.code}
          >
            <DocumentField
              label={t.contacts.presentationUrl}
              urlName={`${item.code}_presentation_url`}
              fileName={`${item.code}_presentation_file`}
              currentUrl={draft[item.code].presentation_url}
              hint={t.contacts.fileHint}
              onUrlChange={(url) =>
                update(item.code, { presentation_url: url })
              }
            />
            <DocumentField
              label={t.contacts.briefUrl}
              urlName={`${item.code}_brief_url`}
              fileName={`${item.code}_brief_file`}
              currentUrl={draft[item.code].brief_url}
              hint={t.contacts.fileHint}
              onUrlChange={(url) => update(item.code, { brief_url: url })}
            />
          </div>
        ))}

        <button type="submit" style={{ ...adminBtnPrimary, maxWidth: 220 }}>
          {t.contacts.save}
        </button>
      </HardNavForm>
    </AdminPageShell>
  );
}
