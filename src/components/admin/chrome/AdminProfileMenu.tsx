"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { createPortal } from "react-dom";
import { useAdminT } from "@/i18n/admin";
import Link from "next/link";
import {
  adminChromeMenuItem,
  adminChromeMenuItemMuted,
  adminChromeMenuPanel,
  adminChromeTrigger,
  adminChromeTriggerActive,
} from "@/components/admin/chrome/menuStyles";
import type { AdminRole } from "@/lib/cms/auth";

export type AdminProfileInfo = {
  email: string;
  role: AdminRole | string;
  displayName: string;
  jobTitle: string;
  avatarUrl: string;
};

type Props = AdminProfileInfo & {
  /** Dense trigger for mobile top bar */
  compact?: boolean;
};

function subscribeNever() {
  return () => undefined;
}

function initialsFrom(name: string, email: string) {
  const source = name.trim() || email.trim();
  if (!source) return "?";
  const parts = source.split(/[\s@.]+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
}

export function AdminProfileMenu({
  email,
  role,
  displayName,
  jobTitle,
  avatarUrl,
  compact = false,
}: Props) {
  const t = useAdminT();
  const menuId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, right: 0 });

  const mounted = useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false,
  );

  const name = displayName.trim() || email.split("@")[0] || email;
  const roleLabel =
    jobTitle.trim() ||
    (role === "owner" || role === "editor" ? t.roles[role] : role);

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

  const avatar = (
    <span
      aria-hidden
      style={{
        width: 28,
        height: 28,
        borderRadius: 0,
        overflow: "hidden",
        flexShrink: 0,
        background: "#1f1f1f",
        border: "1px solid #333",
        display: "grid",
        placeItems: "center",
        fontSize: 11,
        fontWeight: 600,
        color: "#ccc",
      }}
    >
      {avatarUrl.trim() ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={avatarUrl}
          alt=""
          width={28}
          height={28}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : (
        initialsFrom(displayName, email)
      )}
    </span>
  );

  const menu =
    mounted && open
      ? createPortal(
          <div
            ref={panelRef}
            id={menuId}
            role="menu"
            aria-label={t.nav.profile}
            style={{
              ...adminChromeMenuPanel,
              top: coords.top,
              right: coords.right,
              minWidth: 220,
            }}
          >
            <div
              style={{
                padding: "10px 12px 12px",
                borderBottom: "1px solid #2a2a2a",
                marginBottom: 4,
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#fff",
                  lineHeight: 1.3,
                }}
              >
                {name}
              </p>
              <p
                style={{
                  margin: "4px 0 0",
                  fontSize: 12,
                  color: "#888",
                  lineHeight: 1.3,
                  overflowWrap: "anywhere",
                }}
              >
                {email}
              </p>
            </div>
            <Link
              role="menuitem"
              href="/admin/profile/"
              onClick={() => setOpen(false)}
              style={adminChromeMenuItem}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#1a1a1a";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
            >
              <span>{t.nav.profile}</span>
            </Link>
            <form action="/admin/logout/" method="post">
              <button
                role="menuitem"
                type="submit"
                style={adminChromeMenuItemMuted}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#1a1a1a";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                {t.chrome.logout}
              </button>
            </form>
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
        aria-label={compact ? name : undefined}
        onClick={() => setOpen((v) => !v)}
        style={{
          ...adminChromeTrigger,
          ...(open ? adminChromeTriggerActive : null),
          gap: compact ? 0 : 8,
          padding: compact ? 6 : "6px 10px 6px 6px",
          maxWidth: compact ? undefined : 260,
        }}
      >
        {avatar}
        {!compact ? (
          <span
            style={{
              minWidth: 0,
              display: "flex",
              flexDirection: "column",
              gap: 1,
              textAlign: "left",
            }}
          >
            <span
              style={{
                fontSize: 13,
                fontWeight: 600,
                lineHeight: 1.2,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {name}
            </span>
            <span
              style={{
                fontSize: 11,
                fontWeight: 400,
                color: "#888",
                lineHeight: 1.2,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                textTransform: jobTitle.trim() ? "none" : "capitalize",
              }}
            >
              {roleLabel}
            </span>
          </span>
        ) : null}
        {!compact ? (
          <span
            aria-hidden
            style={{
              fontSize: 10,
              color: "#888",
              marginLeft: 2,
              transform: open ? "rotate(180deg)" : "none",
              transition: "transform 120ms ease",
              lineHeight: 1,
              flexShrink: 0,
            }}
          >
            ▾
          </span>
        ) : null}
      </button>
      {menu}
    </>
  );
}
