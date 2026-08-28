"use client";

import {
  forwardRef,
  type FormHTMLAttributes,
  type ReactNode,
} from "react";
import {
  isAdminFailure,
  isAdminRedirect,
  isAdminSuccess,
  type AdminActionResult,
} from "@/lib/cms/admin-redirect";
import { softAdminNav } from "@/components/admin/chrome/nav";
import {
  adminToastError,
  adminToastSuccess,
} from "@/components/admin/toast/AdminToaster";
import { useAdminT } from "@/i18n/admin";

type MutationResult = AdminActionResult | void | null | undefined;

type FormAction = (formData: FormData) => Promise<MutationResult>;
type VoidAction = () => Promise<MutationResult>;

type HardNavFormProps = Omit<FormHTMLAttributes<HTMLFormElement>, "action"> & {
  action: FormAction | VoidAction;
  children: ReactNode;
  /** Toast on success before redirect / settle. */
  successMessage?: string;
  /** Skip hard navigation even if redirectTo is returned. */
  stayOnPage?: boolean;
};

/**
 * Runs a server action, toasts success/error, soft-navigates on redirectTo.
 * Never lets an uncaught action error blank the admin UI.
 */
export async function runAdminMutation(
  action: FormAction | VoidAction,
  formData?: FormData,
  options?: {
    successMessage?: string;
    stayOnPage?: boolean;
    fallbackError?: string;
    defaultSaved?: string;
    defaultReady?: string;
    defaultCreated?: string;
  },
): Promise<boolean> {
  const fallbackError =
    options?.fallbackError ?? "Something went wrong. Please try again.";
  const defaultSaved = options?.defaultSaved ?? "Saved";
  const defaultReady = options?.defaultReady ?? "Done";

  try {
    const result =
      formData === undefined
        ? await (action as VoidAction)()
        : await (action as FormAction)(formData);

    if (isAdminFailure(result)) {
      adminToastError(result.error);
      return false;
    }

    if (isAdminRedirect(result)) {
      adminToastSuccess(
        result.message || options?.successMessage || defaultSaved,
      );
      if (!options?.stayOnPage) {
        softAdminNav(result.redirectTo);
      }
      return true;
    }

    if (isAdminSuccess(result)) {
      adminToastSuccess(result.message || options?.successMessage || defaultReady);
      return true;
    }

    if (options?.successMessage) {
      adminToastSuccess(options.successMessage);
    }
    return true;
  } catch (err) {
    if (
      typeof err === "object" &&
      err !== null &&
      "digest" in err &&
      String((err as { digest?: unknown }).digest).includes("NEXT_REDIRECT")
    ) {
      throw err;
    }
    console.error("[admin mutation]", err);
    const message =
      err instanceof Error && err.message.trim()
        ? err.message
        : typeof err === "string" && err.trim()
          ? err
          : fallbackError;
    adminToastError(message);
    return false;
  }
}

/** Form that toasts + soft-navigates when the server action returns a result. */
export const HardNavForm = forwardRef<HTMLFormElement, HardNavFormProps>(
  function HardNavForm(
    { action, children, successMessage, stayOnPage, ...props },
    ref,
  ) {
    const t = useAdminT();

    return (
      <form
        ref={ref}
        {...props}
        action={async (formData) => {
          await runAdminMutation(action, formData, {
            successMessage,
            stayOnPage,
            fallbackError: t.common.actionFailed,
            defaultSaved: t.common.saved,
            defaultReady: t.common.ready,
          });
        }}
      >
        {children}
      </form>
    );
  },
);

/** Bind `formAction` / button actions. */
export function hardNavAction(
  action: FormAction,
  options?: { successMessage?: string; stayOnPage?: boolean },
): (formData: FormData) => Promise<void> {
  return async (formData) => {
    await runAdminMutation(action, formData, options);
  };
}

/** No-arg create buttons. */
export function hardNavCreate(
  action: VoidAction,
  options?: {
    successMessage?: string;
    stayOnPage?: boolean;
    fallbackError?: string;
    defaultSaved?: string;
    defaultReady?: string;
  },
): () => Promise<void> {
  return async () => {
    await runAdminMutation(action, undefined, {
      successMessage: options?.successMessage,
      stayOnPage: options?.stayOnPage,
      fallbackError: options?.fallbackError,
      defaultSaved: options?.defaultSaved,
      defaultReady: options?.defaultReady ?? options?.successMessage,
    });
  };
}
