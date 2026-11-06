"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Script from "next/script";
import { ProtoBtn } from "@/components/proto/ProtoBtn";
import { ProjectBriefMultiSelect } from "@/components/molecules/ProjectBriefMultiSelect";
import {
  PROJECT_BRIEF_SERVICE_IDS,
  type ProjectBriefServiceId,
} from "@/data/project-brief";
import type { Locale } from "@/i18n/config";
import type { SiteContent } from "@/i18n/types";
import type { PublicCaptchaConfig } from "@/lib/cms/settings";

declare global {
  interface Window {
    turnstile?: {
      render: (
        el: HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          "expired-callback"?: () => void;
        },
      ) => string;
      reset: (widgetId?: string) => void;
    };
    hcaptcha?: {
      render: (
        el: HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          "expired-callback"?: () => void;
        },
      ) => string;
      reset: (widgetId?: string) => void;
    };
  }
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Values = {
  name: string;
  email: string;
  company: string;
  productUrl: string;
  about: string;
};

export function ProjectBriefForm({
  locale,
  ui,
  captcha,
  brief,
  onSuccess,
}: {
  locale: Locale;
  ui: SiteContent["ui"];
  captcha: PublicCaptchaConfig;
  brief: SiteContent["projectBrief"];
  onSuccess?: () => void;
}) {
  const [values, setValues] = useState<Values>({
    name: "",
    email: "",
    company: "",
    productUrl: "",
    about: "",
  });
  const [services, setServices] = useState<ProjectBriefServiceId[]>([]);
  const [consent, setConsent] = useState(false);
  const [captchaToken, setCaptchaToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const widgetHostRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);
  const nameRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    nameRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!captcha.siteKey || !widgetHostRef.current) return;
    if (captcha.provider !== "turnstile" && captcha.provider !== "hcaptcha") {
      return;
    }

    const render = () => {
      if (!widgetHostRef.current || widgetIdRef.current) return;
      if (captcha.provider === "turnstile" && window.turnstile) {
        widgetIdRef.current = window.turnstile.render(widgetHostRef.current, {
          sitekey: captcha.siteKey,
          callback: (token) => setCaptchaToken(token),
          "expired-callback": () => setCaptchaToken(""),
        });
      }
      if (captcha.provider === "hcaptcha" && window.hcaptcha) {
        widgetIdRef.current = window.hcaptcha.render(widgetHostRef.current, {
          sitekey: captcha.siteKey,
          callback: (token) => setCaptchaToken(token),
          "expired-callback": () => setCaptchaToken(""),
        });
      }
    };

    render();
    const id = window.setInterval(render, 400);
    return () => window.clearInterval(id);
  }, [captcha.provider, captcha.siteKey]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");

    if (!EMAIL_RE.test(values.email.trim())) {
      setError(brief.emailInvalid);
      return;
    }
    if (!services.length) {
      setError(brief.helpRequired);
      return;
    }
    if (!consent) {
      setError(ui.consentPrefix);
      return;
    }
    if (
      (captcha.provider === "turnstile" || captcha.provider === "hcaptcha") &&
      captcha.siteKey &&
      !captchaToken
    ) {
      setError(ui.captchaRequired);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/leads/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: "brief",
          locale,
          name: values.name.trim(),
          email: values.email.trim(),
          company: values.company.trim(),
          productUrl: values.productUrl.trim(),
          message: values.about.trim(),
          services,
          consent: true,
          captchaToken,
          website: "",
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(data?.error || "Request failed");
      }
      if (widgetIdRef.current) {
        window.turnstile?.reset(widgetIdRef.current);
        window.hcaptcha?.reset(widgetIdRef.current);
      }
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="fm" onSubmit={handleSubmit} noValidate>
      {captcha.provider === "turnstile" ? (
        <Script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
          strategy="lazyOnload"
        />
      ) : null}
      {captcha.provider === "hcaptcha" ? (
        <Script
          src="https://js.hcaptcha.com/1/api.js?render=explicit"
          strategy="lazyOnload"
        />
      ) : null}

      <label className="sr-only" aria-hidden style={{ position: "absolute", left: "-9999px" }}>
        Website
        <input type="text" name="website" tabIndex={-1} autoComplete="off" />
      </label>

      <div className="fm-2">
        <label className="fld">
          <span>
            {brief.nameLabel} *
          </span>
          <input
            ref={nameRef}
            type="text"
            name="name"
            autoComplete="name"
            required
            placeholder={brief.namePlaceholder}
            value={values.name}
            onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
          />
        </label>
        <label className="fld">
          <span>
            {brief.emailLabel} *
          </span>
          <input
            type="email"
            name="email"
            autoComplete="email"
            inputMode="email"
            required
            placeholder={brief.emailPlaceholder}
            value={values.email}
            onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
          />
        </label>
      </div>

      <div className="fm-2">
        <label className="fld">
          <span>{brief.companyLabel}</span>
          <input
            type="text"
            name="company"
            autoComplete="organization"
            placeholder={brief.companyPlaceholder}
            value={values.company}
            onChange={(e) => setValues((v) => ({ ...v, company: e.target.value }))}
          />
        </label>
        <label className="fld">
          <span>{brief.linkLabel}</span>
          <input
            type="text"
            name="productUrl"
            inputMode="url"
            autoComplete="url"
            placeholder={brief.linkPlaceholder}
            value={values.productUrl}
            onChange={(e) =>
              setValues((v) => ({ ...v, productUrl: e.target.value }))
            }
          />
        </label>
      </div>

      <fieldset className="fld">
        <legend>
          {brief.helpLabel} *
        </legend>
        <ProjectBriefMultiSelect
          label={brief.helpLabel}
          hint={brief.helpHint}
          options={PROJECT_BRIEF_SERVICE_IDS.map((id) => ({
            id,
            label: brief.services[id],
          }))}
          value={services}
          onChange={setServices}
        />
      </fieldset>

      <label className="fld">
        <span>
          {brief.aboutLabel} *
        </span>
        <textarea
          name="message"
          required
          rows={4}
          placeholder={brief.aboutPlaceholder}
          value={values.about}
          onChange={(e) => setValues((v) => ({ ...v, about: e.target.value }))}
        />
      </label>

      {(captcha.provider === "turnstile" || captcha.provider === "hcaptcha") &&
      captcha.siteKey ? (
        <div ref={widgetHostRef} className="project-brief__captcha" />
      ) : null}

      <label className="cns">
        <input
          type="checkbox"
          name="consent"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          required
        />
        <span>
          {ui.consentPrefix}{" "}
          <a
            href={locale === "de" ? "/de/privacy/" : "/privacy/"}
            target="_blank"
            rel="noreferrer"
            className="lnk"
          >
            {ui.consentLinkLabel} ↗
          </a>
          {ui.consentSuffix ? ` ${ui.consentSuffix}` : ""}.
        </span>
      </label>

      {error ? (
        <p className="fm-err" role="alert">
          {error}
        </p>
      ) : (
        <p className="fm-err" role="alert" />
      )}

      <div>
        <ProtoBtn type="submit" className={loading ? "is-loading" : ""}>
          {loading ? brief.submitting : brief.submit}
        </ProtoBtn>
      </div>
    </form>
  );
}
