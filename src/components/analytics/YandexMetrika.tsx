"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { getYandexMetrikaInitScript } from "@/lib/analytics/yandex-metrika-snippet";

interface YandexMetrikaProps {
  counterId: string;
}

declare global {
  interface Window {
    ym?: (counterId: number, method: string, ...args: unknown[]) => void;
    Ya?: {
      _metrika?: {
        getCounters?: () => unknown[];
      };
    };
  }
}

function isStubYm(ym: Window["ym"]): boolean {
  if (typeof ym !== "function") return true;
  try {
    return Function.prototype.toString.call(ym).includes("m[i].a");
  } catch {
    return false;
  }
}

function countersReady(): boolean {
  const list = window.Ya?._metrika?.getCounters?.();
  return Array.isArray(list) && list.length > 0;
}

/** SPA pageviews + counter inject (afterInteractive via client effect). */
export function YandexMetrika({ counterId }: YandexMetrikaProps) {
  const id = Number(counterId);
  const pathname = usePathname();
  const skipNextHit = useRef(true);

  useEffect(() => {
    if (!Number.isFinite(id) || id <= 0) return;
    if (countersReady() || document.getElementById("yandex-metrika")) return;

    const snippet = getYandexMetrikaInitScript(String(id));
    if (!snippet) return;
    const script = document.createElement("script");
    script.id = "yandex-metrika";
    script.text = snippet;
    document.head.appendChild(script);
  }, [id]);

  useEffect(() => {
    if (!Number.isFinite(id) || id <= 0) return;
    if (skipNextHit.current) {
      skipNextHit.current = false;
      return;
    }
    if (isStubYm(window.ym)) return;
    window.ym?.(id, "hit", window.location.href);
  }, [id, pathname]);

  return null;
}
