"use client";

import { useEffect, useState } from "react";
import { LOCATION_CHANGE_EVENT } from "@/utils/scroll";

/** Current `window.location.hash`, kept in sync for pushState hash nav. */
export function useLocationHash(): string {
  const [hash, setHash] = useState("");

  useEffect(() => {
    const sync = () => setHash(window.location.hash);

    sync();
    window.addEventListener("hashchange", sync);
    window.addEventListener("popstate", sync);
    window.addEventListener(LOCATION_CHANGE_EVENT, sync);

    return () => {
      window.removeEventListener("hashchange", sync);
      window.removeEventListener("popstate", sync);
      window.removeEventListener(LOCATION_CHANGE_EVENT, sync);
    };
  }, []);

  return hash;
}
