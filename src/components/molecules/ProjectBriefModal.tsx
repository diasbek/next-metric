"use client";

import { useEffect, useId, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import type { Locale } from "@/i18n/config";
import type { SiteContent } from "@/i18n/types";
import type { PublicCaptchaConfig } from "@/lib/cms/settings";
import {
  trackGoogleAdsLeadConversion,
  trackLinkedInLeadConversion,
} from "@/components/analytics";
import { ProjectBriefForm } from "@/components/molecules/ProjectBriefForm";

function subscribeNever() {
  return () => undefined;
}

const PROC_EN = ["Brief", "Concept", "Production", "Revisions", "Final delivery"];
const PROC_DE = ["Briefing", "Konzept", "Produktion", "Korrekturen", "Finale Lieferung"];

function pad(n: number) {
  return String(n).padStart(2, "0");
}

/** Mounted only while open — closing unmounts and resets the success state. */
export function ProjectBriefModal({
  onClose,
  locale,
  ui,
  captcha,
  brief,
}: {
  onClose: () => void;
  locale: Locale;
  ui: SiteContent["ui"];
  captcha: PublicCaptchaConfig;
  brief: SiteContent["projectBrief"];
}) {
  const titleId = useId();
  const [submitted, setSubmitted] = useState(false);
  const mounted = useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false,
  );
  const de = locale === "de";
  const steps = de ? PROC_DE : PROC_EN;

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.classList.add("project-brief-open");
    document.documentElement.classList.add("lock");
    return () => {
      document.body.style.overflow = prev;
      document.documentElement.classList.remove("project-brief-open");
      document.documentElement.classList.remove("lock");
    };
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    if (!submitted) return;
    trackLinkedInLeadConversion();
    trackGoogleAdsLeadConversion();
  }, [submitted]);

  if (!mounted) return null;

  return createPortal(
    <div className="project-brief bf-overlay">
      <button
        type="button"
        className="project-brief__backdrop"
        aria-label={brief.closeLabel}
        onClick={onClose}
      />
      <div
        className="project-brief__dialog bf-shell"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <button
          type="button"
          className="project-brief__close bf-x"
          aria-label={brief.closeLabel}
          onClick={onClose}
        >
          ×
        </button>

        {submitted ? (
          <div className="fm-ok wrap" role="status">
            <b id={titleId}>{brief.successTitle}</b>
            <p>{brief.successBody}</p>
          </div>
        ) : (
          <section className="bf wrap" aria-labelledby={titleId}>
            <div className="bf-hd">
              <p className="cap" data-in="fade">
                {de ? "Projekt starten" : "Start your project"}
              </p>
              <h1 className="d1" id={titleId} data-in="chars">
                {brief.title.includes("project") || brief.title.includes("Projekt") ? (
                  <>
                    {de ? (
                      <>
                        Erzählen Sie uns von Ihrem <em>Projekt</em>
                      </>
                    ) : (
                      <>
                        Tell us about your <em>project</em>
                      </>
                    )}
                  </>
                ) : (
                  brief.title
                )}
              </h1>
              <p className="lead" data-in="fade">
                {brief.subtitle}
              </p>
              <ol className="bf-n" data-in="stagger">
                {steps.map((step, i) => (
                  <li key={step}>
                    <b>{pad(i + 1)}</b>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
            <ProjectBriefForm
              locale={locale}
              ui={ui}
              captcha={captcha}
              brief={brief}
              onSuccess={() => setSubmitted(true)}
            />
          </section>
        )}
      </div>
    </div>,
    document.body,
  );
}
