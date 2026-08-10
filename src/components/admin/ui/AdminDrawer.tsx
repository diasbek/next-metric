"use client";

import {
  useEffect,
  useSyncExternalStore,
  type CSSProperties,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { ADMIN_TOPBAR_HEIGHT } from "@/components/admin/chrome/AdminTopBar";
import { ADMIN_MD_BREAKPOINT } from "@/components/admin/chrome/nav";
import { ADMIN_TABBAR_RESERVE } from "@/components/admin/ui/styles";
import { useAdminT } from "@/i18n/admin";

function subscribeNever() {
  return () => undefined;
}

type Props = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  /** Accessible name when title omitted */
  ariaLabel?: string;
};

export function AdminDrawer({
  open,
  onClose,
  title,
  children,
  footer,
  ariaLabel,
}: Props) {
  const t = useAdminT();
  const mounted = useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false,
  );

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.classList.add("admin-drawer-open");
    return () => {
      document.body.style.overflow = prev;
      document.documentElement.classList.remove("admin-drawer-open");
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

  const shell: CSSProperties = {
    position: "fixed",
    top: ADMIN_TOPBAR_HEIGHT,
    right: 0,
    bottom: 0,
    width: "min(460px, 100vw)",
    maxHeight: `calc(100svh - ${ADMIN_TOPBAR_HEIGHT}px)`,
    background: "#0c0c0c",
    borderLeft: "1px solid #333",
    zIndex: 100,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    boxShadow: "-12px 0 40px rgba(0,0,0,0.45)",
    boxSizing: "border-box",
  };

  return createPortal(
    <div className="admin-drawer-root">
      <style>{`
        .admin-drawer-backdrop {
          position: fixed;
          inset: 0;
          z-index: 99;
          background: rgba(0,0,0,0.45);
          border: 0;
          padding: 0;
          cursor: pointer;
        }
        .admin-drawer-shell {
          padding-bottom: ${ADMIN_TABBAR_RESERVE};
        }
        @media (min-width: ${ADMIN_MD_BREAKPOINT}px) {
          .admin-drawer-shell {
            padding-bottom: 0;
          }
          html.admin-drawer-open .admin-chrome__tabbar {
            /* tabbar already hidden on desktop */
          }
        }
        @media (max-width: ${ADMIN_MD_BREAKPOINT - 1}px) {
          .admin-drawer-shell {
            left: 0;
            width: 100vw !important;
            border-left: none;
          }
          html.admin-drawer-open .admin-chrome__tabbar {
            visibility: hidden;
            pointer-events: none;
          }
        }
      `}</style>
      <button
        type="button"
        className="admin-drawer-backdrop"
        aria-label={t.chrome.close}
        onClick={onClose}
      />
      <aside
        className="admin-drawer-shell"
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel ?? title ?? "Panel"}
        style={shell}
      >
        <div
          style={{
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            padding: "14px 16px",
            borderBottom: "1px solid #222",
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: 16,
              fontWeight: 600,
              color: "#fff",
              minWidth: 0,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {title ?? ""}
          </p>
          <button
            type="button"
            onClick={onClose}
            style={{
              flexShrink: 0,
              width: 44,
              height: 44,
              borderRadius: 0,
              border: "1px solid #333",
              background: "#151515",
              color: "#fff",
              cursor: "pointer",
              fontSize: 18,
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>
        <div
          style={{
            flex: "1 1 auto",
            minHeight: 0,
            overflowY: "auto",
            padding: 16,
          }}
        >
          {children}
        </div>
        {footer ? (
          <div
            style={{
              flexShrink: 0,
              padding: "12px 16px",
              borderTop: "1px solid #222",
              display: "grid",
              gap: 8,
              background: "#0c0c0c",
            }}
          >
            {footer}
          </div>
        ) : null}
      </aside>
    </div>,
    document.body,
  );
}
