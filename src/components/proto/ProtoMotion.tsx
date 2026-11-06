"use client";

import { useEffect, useRef } from "react";
import { createProtoMotion } from "@/lib/proto/createProtoMotion.js";

/** Mounts concept-site rAF motion (Heat, Ring, Pin, …) on a SSR-rendered tree. */
export function ProtoMotion({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    document.documentElement.classList.add("js");
    let dispose: (() => void) | undefined;
    try {
      dispose = createProtoMotion(root);
    } catch (err) {
      console.warn("[proto-motion]", err);
    }
    return () => {
      dispose?.();
    };
  }, []);

  return (
    <div ref={ref} className="proto-root" data-proto-root>
      <div className="cur" aria-hidden="true" />
      <div className="curl" aria-hidden="true">
        <span />
      </div>
      {children}
    </div>
  );
}
