"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  CONSENT_EVENT,
  CONSENT_STORAGE_KEY,
  readConsent,
  writeConsent,
} from "@/lib/consent/storage";
import type { ConsentStatus } from "@/lib/consent/types";

type ConsentContextValue = {
  /** "pending" until a decision is stored — banner/preferences must stay reachable. */
  status: ConsentStatus;
  analyticsConsent: boolean;
  isPanelOpen: boolean;
  acceptAll: () => void;
  rejectAll: () => void;
  openPreferences: () => void;
  closePanel: () => void;
};

const ConsentContext = createContext<ConsentContextValue | null>(null);

function subscribe(callback: () => void): () => void {
  const onStorage = (event: StorageEvent) => {
    if (event.key === CONSENT_STORAGE_KEY) callback();
  };
  window.addEventListener(CONSENT_EVENT, callback);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(CONSENT_EVENT, callback);
    window.removeEventListener("storage", onStorage);
  };
}

/** Raw string snapshot (not the parsed object) so useSyncExternalStore can
 * cheaply compare it and avoid the "getSnapshot should be cached" pitfall. */
function getSnapshot(): string | null {
  try {
    return window.localStorage.getItem(CONSENT_STORAGE_KEY);
  } catch {
    return null;
  }
}

function getServerSnapshot(): string | null {
  return null;
}

export function ConsentProvider({ children }: { children: ReactNode }) {
  // Synced with localStorage via the browser's storage event / our custom
  // event — this is the React-recommended way to read an external mutable
  // store without setState-in-effect cascades or SSR hydration mismatches.
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [preferencesOpen, setPreferencesOpen] = useState(false);

  const decision = useMemo(() => readConsent(raw), [raw]);
  const status: ConsentStatus = decision ? "resolved" : "pending";
  const analyticsConsent = decision?.analytics ?? false;
  // No decision yet → keep the banner up (no silent dismissal); once
  // resolved, visibility is purely driven by the "manage cookies" toggle.
  const isPanelOpen = decision === null ? true : preferencesOpen;

  const acceptAll = useCallback(() => {
    writeConsent(true);
    setPreferencesOpen(false);
  }, []);

  const rejectAll = useCallback(() => {
    writeConsent(false);
    setPreferencesOpen(false);
  }, []);

  const openPreferences = useCallback(() => setPreferencesOpen(true), []);
  const closePanel = useCallback(() => setPreferencesOpen(false), []);

  const value = useMemo(
    () => ({
      status,
      analyticsConsent,
      isPanelOpen,
      acceptAll,
      rejectAll,
      openPreferences,
      closePanel,
    }),
    [status, analyticsConsent, isPanelOpen, acceptAll, rejectAll, openPreferences, closePanel],
  );

  return <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>;
}

export function useConsent(): ConsentContextValue {
  const ctx = useContext(ConsentContext);
  if (!ctx) {
    throw new Error("useConsent must be used within a ConsentProvider");
  }
  return ctx;
}
