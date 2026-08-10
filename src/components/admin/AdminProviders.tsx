"use client";

import {
  createContext,
  useContext,
  Suspense,
  type ReactNode,
} from "react";
import { AdminErrorBoundary } from "@/components/admin/AdminErrorBoundary";
import { AdminSoftNavBridge } from "@/components/admin/chrome/AdminSoftNavBridge";
import { AdminFlashToasts } from "@/components/admin/toast/AdminFlashToasts";
import { AdminToaster } from "@/components/admin/toast/AdminToaster";
import { AdminI18nProvider } from "@/i18n/admin/AdminI18nProvider";
import type { AdminMessages, AdminUiLocale } from "@/i18n/admin/types";
import { getAdminMessages } from "@/i18n/admin/get-admin-messages";

type AdminSupabaseConfig = {
  url: string;
  publishableKey: string;
};

const AdminSupabaseContext = createContext<AdminSupabaseConfig>({
  url: "",
  publishableKey: "",
});

export function useAdminSupabaseConfig(): AdminSupabaseConfig {
  return useContext(AdminSupabaseContext);
}

export function AdminProviders({
  children,
  locale = "ru",
  messages,
  supabaseUrl = "",
  supabasePublishableKey = "",
}: {
  children: ReactNode;
  locale?: AdminUiLocale;
  messages?: AdminMessages;
  supabaseUrl?: string;
  supabasePublishableKey?: string;
}) {
  const resolved = messages ?? getAdminMessages(locale);

  return (
    <AdminI18nProvider locale={locale} messages={resolved}>
      <AdminSupabaseContext.Provider
        value={{ url: supabaseUrl, publishableKey: supabasePublishableKey }}
      >
        <AdminErrorBoundary>
          <AdminSoftNavBridge>
            <AdminToaster />
            <Suspense fallback={null}>
              <AdminFlashToasts />
            </Suspense>
            {children}
          </AdminSoftNavBridge>
        </AdminErrorBoundary>
      </AdminSupabaseContext.Provider>
    </AdminI18nProvider>
  );
}
