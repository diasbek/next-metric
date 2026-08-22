"use client";

import {
  FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import Script from "next/script";
import { Button } from "@/components/atoms/Button";
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
    const timer = window.setInterval(render, 400);
    return () => window.clearInterval(timer);
  }, [captcha.provider, captcha.siteKey]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const name = values.name.trim();
    const email = values.email.trim();
    const about = values.about.trim();

    if (!EMAIL_RE.test(email)) {
      setError(brief.emailInvalid);
      return;
    }
    if (!services.length) {
      setError(brief.helpRequired);
      return;
    }
    if (
      (captcha.provider === "turnstile" || captcha.provider === "hcaptcha") &&
      !captchaToken
    ) {
      setError(ui.captchaRequired);
      return;
    }
    if (!consent) {
      setError(ui.consentRequired);
      return;
    }

    setLoading(true);
    try {
      const form = event.currentTarget;
      const response = await fetch("/api/leads/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: "brief",
          name,
          email,
          company: values.company.trim(),
          productUrl: values.productUrl.trim(),
          services,
          message: about,
          locale,
          consent: true,
          captchaToken,
          website: String(new FormData(form).get("website") || ""),
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(payload?.error || "Request failed");
      }

      setValues({ name: "", email: "", company: "", productUrl: "", about: "" });
      setServices([]);
      setConsent(false);
      setCaptchaToken("");
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
    <form className="project-brief__form" onSubmit={handleSubmit}>
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

      <label className="project-brief__field">
        <span className="project-brief__label">
          {brief.nameLabel} <span aria-hidden>*</span>
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
          className="project-brief__input ui-input"
        />
      </label>

      <label className="project-brief__field">
        <span className="project-brief__label">
          {brief.emailLabel} <span aria-hidden>*</span>
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
          className="project-brief__input ui-input"
        />
      </label>

      <label className="project-brief__field">
        <span className="project-brief__label">{brief.companyLabel}</span>
        <input
          type="text"
          name="company"
          autoComplete="organization"
          placeholder={brief.companyPlaceholder}
          value={values.company}
          onChange={(e) => setValues((v) => ({ ...v, company: e.target.value }))}
          className="project-brief__input ui-input"
        />
      </label>

      <label className="project-brief__field">
        <span className="project-brief__label">{brief.linkLabel}</span>
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
          className="project-brief__input ui-input"
        />
      </label>

      <div className="project-brief__field">
        <span className="project-brief__label">
          {brief.helpLabel} <span aria-hidden>*</span>
        </span>
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
      </div>

      <label className="project-brief__field">
        <span className="project-brief__label">
          {brief.aboutLabel} <span aria-hidden>*</span>
        </span>
        <textarea
          name="message"
          required
          rows={2}
          placeholder={brief.aboutPlaceholder}
          value={values.about}
          onChange={(e) => setValues((v) => ({ ...v, about: e.target.value }))}
          className="project-brief__input project-brief__input--area ui-input"
        />
      </label>

      {(captcha.provider === "turnstile" || captcha.provider === "hcaptcha") &&
      captcha.siteKey ? (
        <div ref={widgetHostRef} className="project-brief__captcha" />
      ) : null}

      <label className="contact-form__consent project-brief__consent">
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
            className="contact-form__consent-link"
          >
            {ui.consentLinkLabel}
          </a>
          {ui.consentSuffix ? ` ${ui.consentSuffix}` : ""}.
        </span>
      </label>

      {error ? (
        <p className="contact-form__error" role="alert">
          {error}
        </p>
      ) : null}

      <Button
        type="submit"
        variant="primary"
        size="lg"
        disabled={loading}
        className="project-brief__submit metric-cta--full"
      >
        {loading ? brief.submitting : brief.submit}
      </Button>
    </form>
  );
}
