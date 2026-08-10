"use client";

import {
  useCallback,
  useEffect,
  useId,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";

function subscribeNever() {
  return () => undefined;
}

type CaseDetailModalProps = {
  children: ReactNode;
  closeLabel: string;
  title: string;
};

/**
 * Desktop case-study detail as a portal modal (Figma 2015:280).
 * Soft-nav via intercepting routes; Escape / backdrop / X → router.back().
 */
export function CaseDetailModal({
  children,
  closeLabel,
  title,
}: CaseDetailModalProps) {
  const router = useRouter();
  const titleId = useId();
  const mounted = useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false,
  );

  const onClose = useCallback(() => {
    router.back();
  }, [router]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.classList.add("case-modal-open");
    return () => {
      document.body.style.overflow = prev;
      document.documentElement.classList.remove("case-modal-open");
    };
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!mounted) return null;

  return createPortal(
    <div className="case-modal">
      <button
        type="button"
        className="case-modal__backdrop"
        aria-label={closeLabel}
        onClick={onClose}
      />
      <div
        className="case-modal__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <button
          type="button"
          className="case-modal__close"
          aria-label={closeLabel}
          onClick={onClose}
        >
          <span className="case-modal__close-icon" aria-hidden>
            ×
          </span>
        </button>
        <div className="case-modal__panel">
          <h2 id={titleId} className="sr-only">
            {title}
          </h2>
          {children}
        </div>
      </div>
    </div>,
    document.body,
  );
}
