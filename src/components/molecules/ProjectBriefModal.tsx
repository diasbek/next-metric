"use client";

import { useEffect, useId, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import type { Locale } from "@/i18n/config";
import type { SiteContent } from "@/i18n/types";
import type { PublicCaptchaConfig } from "@/lib/cms/settings";
import { ProjectBriefForm } from "@/components/molecules/ProjectBriefForm";

function subscribeNever() {
  return () => undefined;
}

export function ProjectBriefModal({
  open,
  onClose,
  locale,
  ui,
  captcha,
  brief,
}: {
  open: boolean;
  onClose: () => void;
  locale: Locale;
  ui: SiteContent["ui"];
  captcha: PublicCaptchaConfig;
  brief: SiteContent["projectBrief"];
}) {
  const titleId = useId();
  const mounted = useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false,
  );

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.classList.add("project-brief-open");
    return () => {
      document.body.style.overflow = prev;
      document.documentElement.classList.remove("project-brief-open");
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!mounted || !open) return null;

  return createPortal(
    <div className="project-brief">
      <button
        type="button"
        className="project-brief__backdrop"
        aria-label={brief.closeLabel}
        onClick={onClose}
      />
      <div
        className="project-brief__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <button
          type="button"
          className="project-brief__close"
          aria-label={brief.closeLabel}
          onClick={onClose}
        >
          <span aria-hidden>×</span>
        </button>
        <div className="project-brief__panel">
          <header className="project-brief__intro">
            <h2 id={titleId} className="project-brief__title font-display">
              {brief.title}
            </h2>
            <p className="project-brief__subtitle">{brief.subtitle}</p>
          </header>
          <ProjectBriefForm
            locale={locale}
            ui={ui}
            captcha={captcha}
            brief={brief}
          />
        </div>
      </div>
    </div>,
    document.body,
  );
}
