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
  status: ConsentStatus;
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
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [preferencesOpen, setPreferencesOpen] = useState(false);

  const decision = useMemo(() => readConsent(raw), [raw]);
  const status: ConsentStatus = decision ? "resolved" : "pending";
  const isPanelOpen = decision === null ? true : preferencesOpen;

  const acceptAll = useCallback(() => {
    writeConsent("accepted");
    setPreferencesOpen(false);
  }, []);

  const rejectAll = useCallback(() => {
    writeConsent("necessary");
    setPreferencesOpen(false);
  }, []);

  const openPreferences = useCallback(() => setPreferencesOpen(true), []);
  const closePanel = useCallback(() => setPreferencesOpen(false), []);

  const value = useMemo(
    () => ({
      status,
      isPanelOpen,
      acceptAll,
      rejectAll,
      openPreferences,
      closePanel,
    }),
    [status, isPanelOpen, acceptAll, rejectAll, openPreferences, closePanel],
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
