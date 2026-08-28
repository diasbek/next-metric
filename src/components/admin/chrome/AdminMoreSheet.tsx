"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useAdminT } from "@/i18n/admin";
import { AdminNavList } from "@/components/admin/chrome/AdminDesktopSidebar";
import type { AdminNavItem } from "@/components/admin/chrome/nav";
import { adminChromeNavLink } from "@/components/admin/chrome/menuStyles";

const SHEET_RATIO = 0.92;
const CLOSE_PX = 72;
const VELOCITY_CLOSE = 0.7;
const EXIT_MS = 140;

type Props = {
  open: boolean;
  onClose: () => void;
  items: AdminNavItem[];
  pathname: string;
};

function subscribeNever() {
  return () => undefined;
}

export function AdminMoreSheet({
  open,
  onClose,
  items,
  pathname,
}: Props) {
  const t = useAdminT();
  const canPortal = useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false,
  );

  const [present, setPresent] = useState(open);
  const [shown, setShown] = useState(false);
  const [viewportH, setViewportH] = useState(800);
  const [dragging, setDragging] = useState(false);
  const [dragY, setDragY] = useState(0);

  const dragStartY = useRef(0);
  const lastY = useRef(0);
  const lastT = useRef(0);
  const velocity = useRef(0);
  const showFrame = useRef(0);

  useEffect(() => {
    const apply = () => setViewportH(window.innerHeight);
    apply();
    window.addEventListener("resize", apply);
    return () => window.removeEventListener("resize", apply);
  }, []);

  useEffect(() => {
    if (open) {
      setPresent(true);
      setDragY(0);
      cancelAnimationFrame(showFrame.current);
      showFrame.current = requestAnimationFrame(() => {
        showFrame.current = requestAnimationFrame(() => setShown(true));
      });
      return () => cancelAnimationFrame(showFrame.current);
    }
    setShown(false);
    setDragging(false);
    setDragY(0);
    const timer = window.setTimeout(() => setPresent(false), EXIT_MS);
    return () => window.clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (!present) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [present]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const settle = useCallback(
    (y: number, v: number) => {
      if (v > VELOCITY_CLOSE || y > CLOSE_PX) {
        onClose();
        return;
      }
      setDragY(0);
    },
    [onClose],
  );

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragging(true);
    dragStartY.current = event.clientY;
    lastY.current = event.clientY;
    lastT.current = performance.now();
    velocity.current = 0;
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    const dy = Math.max(0, event.clientY - dragStartY.current);
    setDragY(dy);
    const now = performance.now();
    const dt = Math.max(1, now - lastT.current);
    velocity.current = (event.clientY - lastY.current) / dt;
    lastY.current = event.clientY;
    lastT.current = now;
  };

  const onPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      /* already released */
    }
    setDragging(false);
    settle(dragY, velocity.current);
  };

  if (!canPortal || !present) return null;

  const height = Math.round(viewportH * SHEET_RATIO);
  const translate = shown && !dragging ? 0 : dragging ? dragY : height;
  const backdrop = shown ? Math.max(0, 0.5 * (1 - dragY / height)) : 0;

  return createPortal(
    <div
      aria-hidden={!open}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 80,
        pointerEvents: open || shown ? "auto" : "none",
      }}
    >
      <button
        type="button"
        aria-label={t.chrome.close}
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          border: 0,
          padding: 0,
          margin: 0,
          background: `rgba(0,0,0,${backdrop})`,
          transition: dragging ? "none" : `background ${EXIT_MS}ms ease-out`,
          cursor: "pointer",
        }}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={t.chrome.moreNav}
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height,
          maxHeight: "100dvh",
          background: "#111",
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          border: "1px solid #2a2a2a",
          borderBottom: 0,
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 -12px 40px rgba(0,0,0,0.45)",
          transform: `translate3d(0, ${translate}px, 0)`,
          transition: dragging
            ? "none"
            : `transform ${EXIT_MS}ms cubic-bezier(0.32, 0.72, 0, 1)`,
          willChange: "transform",
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
          overflow: "hidden",
        }}
      >
        <div
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          style={{
            flexShrink: 0,
            touchAction: "none",
            cursor: "grab",
            padding: "10px 16px 8px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 10,
            userSelect: "none",
          }}
        >
          <div
            style={{
              width: 40,
              height: 5,
              borderRadius: 0,
              background: "#555",
            }}
          />
          <p
            style={{
              margin: 0,
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              color: "#aaa",
              alignSelf: "stretch",
            }}
          >
            {t.chrome.moreNav}
          </p>
        </div>

        <div
          style={{
            flex: "1 1 auto",
            minHeight: 0,
            overflowY: "auto",
            padding: "0 12px 20px",
            display: "grid",
            gap: 16,
          }}
        >
          <AdminNavList items={items} pathname={pathname} onNavigate={onClose} />

          <div
            style={{
              borderTop: "1px solid #2a2a2a",
              paddingTop: 14,
              display: "grid",
              gap: 12,
            }}
          >
            <Link
              href="/"
              prefetch={false}
              style={{
                ...adminChromeNavLink,
                padding: "12px 14px",
                fontSize: 15,
                color: "#aaa",
              }}
            >
              {t.chrome.site}
            </Link>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
