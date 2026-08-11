"use client";

import {
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

export function AdminProviders({
  children,
  locale = "en",
  messages,
}: {
  children: ReactNode;
  locale?: AdminUiLocale;
  messages?: AdminMessages;
}) {
  const resolved = messages ?? getAdminMessages(locale);

  return (
    <AdminI18nProvider locale={locale} messages={resolved}>
      <AdminErrorBoundary>
        <AdminSoftNavBridge>
          <AdminToaster />
          <Suspense fallback={null}>
            <AdminFlashToasts />
          </Suspense>
          {children}
        </AdminSoftNavBridge>
      </AdminErrorBoundary>
    </AdminI18nProvider>
  );
}
