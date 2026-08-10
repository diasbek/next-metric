"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { createPortal } from "react-dom";
import { locales, localeLabels, type Locale } from "@/i18n/config";
import {
  adminChromeMenuItem,
  adminChromeMenuPanel,
  adminChromeTrigger,
  adminChromeTriggerActive,
} from "@/components/admin/chrome/menuStyles";
import { useAdminI18n } from "./AdminI18nProvider";
import { setAdminUiLocaleAction } from "./set-locale-action";

function subscribeNever() {
  return () => undefined;
}

export function AdminLocaleSwitcher() {
  const { locale, t } = useAdminI18n();
  const menuId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [coords, setCoords] = useState({ top: 0, right: 0 });

  const mounted = useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false,
  );

  const placeMenu = () => {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setCoords({
      top: rect.bottom + 8,
      right: Math.max(8, window.innerWidth - rect.right),
    });
  };

  useEffect(() => {
    if (!open) return;
    placeMenu();
    const onReposition = () => placeMenu();
    window.addEventListener("resize", onReposition);
    window.addEventListener("scroll", onReposition, true);
    return () => {
      window.removeEventListener("resize", onReposition);
      window.removeEventListener("scroll", onReposition, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const onPointer = (event: MouseEvent | PointerEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (triggerRef.current?.contains(target)) return;
      if (panelRef.current?.contains(target)) return;
      setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  const setLocale = (next: Locale) => {
    if (next === locale || pending) {
      setOpen(false);
      return;
    }
    setPending(true);
    void setAdminUiLocaleAction(next).then((result) => {
      if (result.ok) {
        window.location.reload();
        return;
      }
      setPending(false);
      setOpen(false);
    });
  };

  const menu =
    mounted && open
      ? createPortal(
          <div
            ref={panelRef}
            id={menuId}
            role="menu"
            aria-label={t.chrome.language}
            style={{
              ...adminChromeMenuPanel,
              top: coords.top,
              right: coords.right,
              minWidth: 88,
            }}
          >
            {locales.map((code) => {
              const active = code === locale;
              return (
                <button
                  key={code}
                  type="button"
                  role="menuitemradio"
                  aria-checked={active}
                  disabled={pending}
                  onClick={() => setLocale(code)}
                  style={{
                    ...adminChromeMenuItem,
                    justifyContent: "center",
                    background: active ? "#1a1a1a" : "transparent",
                    fontWeight: active ? 600 : 400,
                    opacity: pending && !active ? 0.55 : 1,
                    letterSpacing: "0.04em",
                  }}
                  onMouseEnter={(e) => {
                    if (!active) e.currentTarget.style.background = "#1a1a1a";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = active
                      ? "#1a1a1a"
                      : "transparent";
                  }}
                >
                  {localeLabels[code]}
                </button>
              );
            })}
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-label={t.chrome.language}
        disabled={pending}
        onClick={() => setOpen((v) => !v)}
        style={{
          ...adminChromeTrigger,
          ...(open || pending ? adminChromeTriggerActive : null),
          cursor: pending ? "wait" : "pointer",
          letterSpacing: "0.04em",
        }}
      >
        <span>{localeLabels[locale]}</span>
        <span
          aria-hidden
          style={{
            fontSize: 10,
            color: "#888",
            transform: open ? "rotate(180deg)" : "none",
            transition: "transform 120ms ease",
            lineHeight: 1,
          }}
        >
          ▾
        </span>
      </button>
      {menu}
    </>
  );
}
