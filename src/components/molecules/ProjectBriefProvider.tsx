"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Locale } from "@/i18n/config";
import type { SiteContent } from "@/i18n/types";
import type { PublicCaptchaConfig } from "@/lib/cms/settings";
import { ProjectBriefModal } from "@/components/molecules/ProjectBriefModal";

type ProjectBriefContextValue = {
  open: () => void;
  close: () => void;
  isOpen: boolean;
};

const ProjectBriefContext = createContext<ProjectBriefContextValue | null>(null);

export function useProjectBrief() {
  const ctx = useContext(ProjectBriefContext);
  if (!ctx) {
    throw new Error("useProjectBrief must be used within ProjectBriefProvider");
  }
  return ctx;
}

/** No-op brief context for admin site previews (no modal chrome). */
export function ProjectBriefPreviewProvider({ children }: { children: ReactNode }) {
  const value = useMemo<ProjectBriefContextValue>(
    () => ({
      open: () => {},
      close: () => {},
      isOpen: false,
    }),
    [],
  );
  return (
    <ProjectBriefContext.Provider value={value}>{children}</ProjectBriefContext.Provider>
  );
}

function clearBriefQuery() {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  if (!url.searchParams.has("brief")) return;
  url.searchParams.delete("brief");
  const next = `${url.pathname}${url.search}${url.hash}`;
  window.history.replaceState(null, "", next);
}

export function ProjectBriefProvider({
  locale,
  ui,
  captcha,
  brief,
  children,
}: {
  locale: Locale;
  ui: SiteContent["ui"];
  captcha: PublicCaptchaConfig;
  brief: SiteContent["projectBrief"];
  children: ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => {
    setIsOpen(false);
    clearBriefQuery();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("brief") !== "1") return;
    const id = requestAnimationFrame(() => setIsOpen(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const value = useMemo(
    () => ({ open, close, isOpen }),
    [open, close, isOpen],
  );

  return (
    <ProjectBriefContext.Provider value={value}>
      {children}
      {isOpen ? (
        <ProjectBriefModal
          onClose={close}
          locale={locale}
          ui={ui}
          captcha={captcha}
          brief={brief}
        />
      ) : null}
    </ProjectBriefContext.Provider>
  );
}
