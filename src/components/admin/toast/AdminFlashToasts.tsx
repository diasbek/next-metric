"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  adminToastError,
  adminToastSuccess,
  adminToastWarn,
} from "@/components/admin/toast/AdminToaster";
import { useAdminT } from "@/i18n/admin";

/**
 * Converts legacy `?saved=1` / `?ok=` / `?error=` query flags into toasts,
 * then strips them from the URL without soft-navigating the App Router.
 */
export function AdminFlashToasts() {
  const params = useSearchParams();
  const t = useAdminT();

  useEffect(() => {
    const SUCCESS: Record<string, string> = {
      "1": t.flash.saved,
      invited: t.flash.invited,
      role: t.flash.role,
      revoked: t.flash.revoked,
      password: t.flash.password,
    };

    const ERRORS: Record<string, string> = {
      email: t.flash.errorEmail,
      role: t.flash.errorRole,
      password: t.flash.errorPassword,
      missing: t.flash.errorMissing,
      self: t.flash.errorSelf,
      "last-owner": t.flash.errorLastOwner,
      "not-admin": t.flash.errorNotAdmin,
      forbidden: t.flash.errorForbidden,
      "setup-locked": t.flash.errorSetupLocked,
      "no-token": t.flash.errorNoToken,
      "no-chats": t.flash.errorNoChats,
      ping: t.flash.errorPing,
      media: t.flash.errorMedia,
    };

    const saved = params.get("saved");
    const ok = params.get("ok");
    const webhook = params.get("webhook");
    const test = params.get("test");
    const ping = params.get("ping");
    const uploaded = params.get("uploaded");
    const error = params.get("error");

    if (saved === "1") adminToastSuccess(SUCCESS["1"]);
    if (ok && SUCCESS[ok]) adminToastSuccess(SUCCESS[ok]);
    if (webhook === "ok") adminToastSuccess(t.flash.webhookOk);
    if (webhook === "removed") adminToastWarn(t.flash.webhookRemoved);
    if (test === "1") adminToastSuccess(t.flash.testSent);
    if (ping === "1") adminToastSuccess(t.flash.pingSent);
    if (uploaded) adminToastSuccess(t.flash.uploaded);

    if (error) {
      const decoded = decodeURIComponent(error);
      adminToastError(ERRORS[decoded] ?? decoded);
    }

    if (saved || ok || webhook || test || ping || uploaded || error) {
      const url = new URL(window.location.href);
      ["saved", "ok", "webhook", "test", "ping", "uploaded", "error"].forEach(
        (key) => url.searchParams.delete(key),
      );
      window.history.replaceState({}, "", url.pathname + url.search + url.hash);
    }
  }, [params, t]);

  return null;
}
