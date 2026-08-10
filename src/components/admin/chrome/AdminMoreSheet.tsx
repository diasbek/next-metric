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

type Snap = "closed" | "peek" | "expanded";

const PEEK_RATIO = 0.48;
const EXPANDED_RATIO = 0.92;
const CLOSE_RATIO = 0.18;
const VELOCITY_CLOSE = 0.85;
const VELOCITY_EXPAND = -0.55;

type Props = {
  open: boolean;
  onClose: () => void;
  items: AdminNavItem[];
  pathname: string;
};

function subscribeNever() {
  return () => undefined;
}

function sheetHeightPx(snap: Snap, viewportH: number) {
  if (snap === "closed") return 0;
  const ratio = snap === "expanded" ? EXPANDED_RATIO : PEEK_RATIO;
  return Math.round(viewportH * ratio);
}

export function AdminMoreSheet({
  open,
  onClose,
  items,
  pathname,
}: Props) {
  const t = useAdminT();
  const mounted = useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false,
  );

  const [snap, setSnap] = useState<Snap>("closed");
  const [dragHeight, setDragHeight] = useState<number | null>(null);
  const [viewportH, setViewportH] = useState(800);
  const [dragging, setDragging] = useState(false);

  const dragStartY = useRef(0);
  const dragStartH = useRef(0);
  const lastY = useRef(0);
  const lastT = useRef(0);
  const velocity = useRef(0);

  // Keep snap in sync with `open` during render (React-approved pattern).
  const [openSynced, setOpenSynced] = useState(open);
  if (open !== openSynced) {
    setOpenSynced(open);
    if (open) {
      setSnap("peek");
      setDragHeight(null);
    } else {
      setSnap("closed");
      setDragHeight(null);
    }
  }

  useEffect(() => {
    const apply = () => setViewportH(window.innerHeight);
    apply();
    window.addEventListener("resize", apply);
    return () => window.removeEventListener("resize", apply);
  }, []);

  useEffect(() => {
    if (snap === "closed") return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [snap]);

  useEffect(() => {
    if (snap === "closed") return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [snap, onClose]);

  const baseHeight = sheetHeightPx(snap, viewportH);
  const height = dragHeight ?? baseHeight;
  const visible = snap !== "closed" || (dragHeight !== null && dragHeight > 0);

  const settle = useCallback(
    (h: number, v: number) => {
      if (v > VELOCITY_CLOSE || h < viewportH * CLOSE_RATIO) {
        setDragHeight(null);
        setSnap("closed");
        onClose();
        return;
      }
      const peek = sheetHeightPx("peek", viewportH);
      const expanded = sheetHeightPx("expanded", viewportH);
      if (v < VELOCITY_EXPAND || h > (peek + expanded) / 2) {
        setSnap("expanded");
      } else {
        setSnap("peek");
      }
      setDragHeight(null);
    },
    [onClose, viewportH],
  );

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragging(true);
    dragStartY.current = event.clientY;
    dragStartH.current = height;
    lastY.current = event.clientY;
    lastT.current = performance.now();
    velocity.current = 0;
    setDragHeight(height);
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    const dy = dragStartY.current - event.clientY;
    const next = Math.min(
      viewportH * EXPANDED_RATIO,
      Math.max(0, dragStartH.current + dy),
    );
    setDragHeight(next);

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
    settle(dragHeight ?? height, velocity.current);
  };

  if (!mounted || (!visible && snap === "closed")) return null;

  const backdropOpacity = Math.min(0.55, (height / Math.max(viewportH, 1)) * 0.7);

  return createPortal(
    <div
      aria-hidden={snap === "closed"}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 80,
        pointerEvents: visible ? "auto" : "none",
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
          background: `rgba(0,0,0,${backdropOpacity})`,
          transition: dragging ? "none" : "background 180ms ease",
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
          transition: dragging
            ? "none"
            : "height 220ms cubic-bezier(0.32, 0.72, 0, 1)",
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
