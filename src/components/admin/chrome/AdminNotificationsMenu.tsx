"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { createPortal } from "react-dom";
import { formatAdminMessage, useAdminT } from "@/i18n/admin";
import type { AdminMessages } from "@/i18n/admin/types";
import { IconNotifications } from "@/components/admin/chrome/AdminNavIcons";
import {
  adminChromeMenuItem,
  adminChromeMenuItemMuted,
  adminChromeMenuPanel,
  adminChromeTrigger,
  adminChromeTriggerActive,
} from "@/components/admin/chrome/menuStyles";
import type { AdminNotificationItem } from "@/components/admin/chrome/notifications";
import Link from "next/link";

function subscribeNever() {
  return () => undefined;
}

function relativeTime(iso: string, leads: AdminMessages["leads"]): string {
  const ms = Date.now() - new Date(iso).getTime();
  const min = Math.floor(ms / 60000);
  if (min < 1) return leads.justNow;
  if (min < 60) return formatAdminMessage(leads.minutesAgo, { n: min });
  const h = Math.floor(min / 60);
  if (h < 24) return formatAdminMessage(leads.hoursAgo, { n: h });
  const d = Math.floor(h / 24);
  if (d < 14) return formatAdminMessage(leads.daysAgo, { n: d });
  return new Date(iso).toLocaleDateString();
}

function statusLabel(
  status: string | undefined,
  leads: AdminMessages["leads"],
): string | null {
  if (status === "new") return leads.statusNew;
  if (status === "read") return leads.statusRead;
  if (status === "archived") return leads.statusArchived;
  return null;
}

export function AdminNotificationsMenu() {
  const t = useAdminT();
  const menuId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, right: 0 });
  const [items, setItems] = useState<AdminNotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const mounted = useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false,
  );

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/notifications/", {
        cache: "no-store",
      });
      if (!res.ok) {
        setItems([]);
        setUnreadCount(0);
        return;
      }
      const data = (await res.json()) as {
        items?: AdminNotificationItem[];
        unreadCount?: number;
      };
      setItems(data.items ?? []);
      setUnreadCount(data.unreadCount ?? 0);
    } catch {
      setItems([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadNotifications();
  }, []);

  useEffect(() => {
    if (open) void loadNotifications();
  }, [open]);

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

  const badge =
    unreadCount > 0
      ? unreadCount > 99
        ? "99+"
        : String(unreadCount)
      : null;

  const menu =
    mounted && open
      ? createPortal(
          <div
            ref={panelRef}
            id={menuId}
            role="menu"
            aria-label={t.chrome.notifications}
            style={{
              ...adminChromeMenuPanel,
              top: coords.top,
              right: coords.right,
              minWidth: 300,
              maxWidth: "min(360px, calc(100vw - 16px))",
              padding: 0,
              gap: 0,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                justifyContent: "space-between",
                gap: 12,
                padding: "12px 14px",
                borderBottom: "1px solid #2a2a2a",
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#fff",
                }}
              >
                {t.chrome.notifications}
              </p>
              {unreadCount > 0 ? (
                <span style={{ fontSize: 12, color: "#888" }}>
                  {formatAdminMessage(t.chrome.notificationsUnread, {
                    n: unreadCount,
                  })}
                </span>
              ) : null}
            </div>

            <div
              style={{
                maxHeight: "min(420px, 60vh)",
                overflowY: "auto",
                display: "grid",
              }}
            >
              {items.length === 0 ? (
                <p
                  style={{
                    margin: 0,
                    padding: "20px 14px",
                    fontSize: 13,
                    color: "#888",
                  }}
                >
                  {loading ? "…" : t.chrome.notificationsEmpty}
                </p>
              ) : (
                items.map((item) => {
                  const isNew =
                    item.kind === "lead" && item.meta?.status === "new";
                  const status = statusLabel(item.meta?.status, t.leads);
                  return (
                    <Link
                      key={item.id}
                      role="menuitem"
                      href={item.href}
                      onClick={() => setOpen(false)}
                      style={{
                        ...adminChromeMenuItem,
                        display: "grid",
                        gap: 4,
                        padding: "12px 14px",
                        borderBottom: "1px solid #1f1f1f",
                        background: isNew ? "#121218" : "transparent",
                        borderLeft: isNew
                          ? "2px solid #2600ff"
                          : "2px solid transparent",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#1a1a1a";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = isNew
                          ? "#121218"
                          : "transparent";
                      }}
                    >
                      <span
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: 10,
                          alignItems: "baseline",
                        }}
                      >
                        <span
                          style={{
                            fontWeight: 600,
                            fontSize: 13,
                            color: "#fff",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {item.title}
                        </span>
                        <span
                          style={{
                            flexShrink: 0,
                            fontSize: 11,
                            color: "#666",
                          }}
                        >
                          {relativeTime(item.createdAt, t.leads)}
                        </span>
                      </span>
                      {item.body ? (
                        <span
                          style={{
                            fontSize: 12,
                            color: "#999",
                            overflow: "hidden",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                          }}
                        >
                          {item.body}
                        </span>
                      ) : null}
                      {status ? (
                        <span
                          style={{
                            fontSize: 11,
                            color: isNew ? "#8af" : "#777",
                            marginTop: 2,
                          }}
                        >
                          {item.kind === "lead"
                            ? t.chrome.notificationsLead
                            : t.chrome.notificationsSystem}
                          {" · "}
                          {status}
                        </span>
                      ) : (
                        <span
                          style={{
                            fontSize: 11,
                            color: "#777",
                            marginTop: 2,
                          }}
                        >
                          {item.kind === "lead"
                            ? t.chrome.notificationsLead
                            : t.chrome.notificationsSystem}
                        </span>
                      )}
                    </Link>
                  );
                })
              )}
            </div>

            <div style={{ padding: 8, borderTop: "1px solid #2a2a2a" }}>
              <Link
                role="menuitem"
                href="/admin/leads/"
                onClick={() => setOpen(false)}
                style={{
                  ...adminChromeMenuItemMuted,
                  marginTop: 0,
                  justifyContent: "center",
                  textAlign: "center",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#1a1a1a";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                {t.chrome.notificationsViewAll}
              </Link>
            </div>
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
        aria-label={
          badge
            ? formatAdminMessage(t.chrome.notificationsAriaUnread, {
                n: unreadCount,
              })
            : t.chrome.notifications
        }
        onClick={() => setOpen((v) => !v)}
        style={{
          ...adminChromeTrigger,
          ...(open ? adminChromeTriggerActive : null),
          position: "relative",
          width: 40,
          padding: 0,
          justifyContent: "center",
        }}
      >
        <IconNotifications size={18} />
        {badge ? (
          <span
            aria-hidden
            style={{
              position: "absolute",
              top: 4,
              right: 4,
              minWidth: 16,
              height: 16,
              padding: "0 4px",
              borderRadius: 0,
              background: "#2600ff",
              color: "#fff",
              fontSize: 10,
              fontWeight: 700,
              lineHeight: "16px",
              textAlign: "center",
              boxSizing: "border-box",
            }}
          >
            {badge}
          </span>
        ) : null}
      </button>
      {menu}
    </>
  );
}
