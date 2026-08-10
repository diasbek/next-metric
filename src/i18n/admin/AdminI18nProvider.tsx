"use client";

import {
  createContext,
  useContext,
  type ReactNode,
} from "react";
import type { Locale } from "@/i18n/config";
import type { AdminMessages } from "./types";
import { getAdminMessages } from "./get-admin-messages";

type AdminI18nValue = {
  locale: Locale;
  t: AdminMessages;
};

const AdminI18nContext = createContext<AdminI18nValue>({
  locale: "en",
  t: getAdminMessages("en"),
});

export function AdminI18nProvider({
  locale,
  messages,
  children,
}: {
  locale: Locale;
  messages: AdminMessages;
  children: ReactNode;
}) {
  return (
    <AdminI18nContext.Provider value={{ locale, t: messages }}>
      {children}
    </AdminI18nContext.Provider>
  );
}

export function useAdminI18n() {
  return useContext(AdminI18nContext);
}

export function useAdminT() {
  return useAdminI18n().t;
}
