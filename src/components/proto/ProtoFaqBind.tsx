"use client";

import { useEffect } from "react";

/** Accordion behaviour for concept FAQ (.fq-q / .fq-a). */
export function ProtoFaqBind() {
  useEffect(() => {
    const root = document.querySelector("[data-proto-root]");
    if (!root) return;

    const onClick = (event: Event) => {
      const btn = (event.target as Element | null)?.closest?.(".fq-q");
      if (!btn || !root.contains(btn)) return;
      event.preventDefault();
      const item = btn.closest(".fq-i");
      if (!item) return;
      const panel = item.querySelector(".fq-a") as HTMLElement | null;
      const open = btn.getAttribute("aria-expanded") === "true";
      root.querySelectorAll(".fq-q").forEach((b) => {
        b.setAttribute("aria-expanded", "false");
        const p = b.closest(".fq-i")?.querySelector(".fq-a");
        if (p) p.setAttribute("hidden", "");
      });
      if (!open && panel) {
        btn.setAttribute("aria-expanded", "true");
        panel.removeAttribute("hidden");
      }
    };

    root.addEventListener("click", onClick);
    return () => root.removeEventListener("click", onClick);
  }, []);

  return null;
}
