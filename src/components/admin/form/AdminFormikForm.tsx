"use client";

import type { FormikHelpers } from "formik";
import { Form, Formik } from "formik";
import type { CSSProperties, ReactNode } from "react";
import { runAdminMutation } from "@/components/admin/HardNavForm";
import { adminToastError } from "@/components/admin/toast/AdminToaster";
import type { AdminActionResult } from "@/lib/cms/admin-redirect";
import type { AnyObjectSchema } from "yup";

type Values = Record<string, unknown>;

type Props<T extends Values> = {
  initialValues: T;
  validationSchema: AnyObjectSchema;
  /** Build FormData (and optional files) from validated Formik values. */
  toFormData: (values: T) => FormData | Promise<FormData>;
  action: (
    formData: FormData,
  ) => Promise<AdminActionResult | void | null | undefined>;
  children:
    | ReactNode
    | ((
        helpers: FormikHelpers<T> & { values: T; isSubmitting: boolean },
      ) => ReactNode);
  successMessage?: string;
  stayOnPage?: boolean;
  enableReinitialize?: boolean;
  style?: CSSProperties;
};

/**
 * Formik + Yup + server action + toast + soft-nav.
 * Use for admin editors that need client validation before hitting the server.
 */
export function AdminFormikForm<T extends Values>({
  initialValues,
  validationSchema,
  toFormData,
  action,
  children,
  successMessage,
  stayOnPage,
  enableReinitialize = true,
  style,
}: Props<T>) {
  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      enableReinitialize={enableReinitialize}
      onSubmit={async (values, helpers) => {
        try {
          const formData = await toFormData(values);
          const ok = await runAdminMutation(action, formData, {
            successMessage,
            stayOnPage,
          });
          if (!ok) helpers.setSubmitting(false);
        } catch (err) {
          const message =
            err instanceof Error && err.message.trim()
              ? err.message
              : "Could not prepare the form";
          adminToastError(message);
          helpers.setSubmitting(false);
        }
      }}
    >
      {(formik) => (
        <Form style={style} encType="multipart/form-data">
          {formik.isSubmitting ? (
            <input type="hidden" data-admin-form-pending="true" />
          ) : null}
          {typeof children === "function"
            ? children({
                ...formik,
                values: formik.values,
                isSubmitting: formik.isSubmitting,
              })
            : children}
        </Form>
      )}
    </Formik>
  );
}
