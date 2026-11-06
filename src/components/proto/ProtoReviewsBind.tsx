"use client";

import { useEffect } from "react";

/** Horizontal review scroller controls (`[data-rv]`). */
export function ProtoReviewsBind() {
  useEffect(() => {
    const root = document.querySelector("[data-proto-root]");
    if (!root) return;

    const onClick = (event: Event) => {
      const btn = (event.target as Element | null)?.closest?.("[data-rv]");
      if (!btn || !root.contains(btn)) return;
      const sc = root.querySelector("#rv-sc") as HTMLElement | null;
      if (!sc) return;
      const dir = Number(btn.getAttribute("data-rv") || "1");
      const card = sc.querySelector(".rq");
      const step = card ? (card as HTMLElement).offsetWidth + 24 : 320;
      sc.scrollBy({ left: dir * step, behavior: "smooth" });
    };

    root.addEventListener("click", onClick);
    return () => root.removeEventListener("click", onClick);
  }, []);

  return null;
}
