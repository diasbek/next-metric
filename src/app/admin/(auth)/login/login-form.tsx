"use client";

import { Formik, Form } from "formik";
import { useEffect, useState } from "react";
import { FormikTextField } from "@/components/admin/form/FormikFields";
import {
  adminToastError,
  adminToastSuccess,
} from "@/components/admin/toast/AdminToaster";
import { loginSchema } from "@/lib/cms/admin-schemas";
import { useAdminT } from "@/i18n/admin";

type AdminLoginFormProps = {
  initialError?: string;
  nextPath?: string;
};

type LoginApiResult = { ok: true } | { ok: false; error: string };

export function AdminLoginForm({
  initialError = "",
  nextPath,
}: AdminLoginFormProps) {
  const t = useAdminT();
  const [bootError] = useState(initialError);

  useEffect(() => {
    if (bootError) adminToastError(bootError);
  }, [bootError]);

  return (
    <div
      style={{
        minHeight: "100svh",
        display: "grid",
        placeItems: "center",
        background: "#000",
        color: "#fff",
        padding: 24,
      }}
    >
      <Formik
        initialValues={{ email: "", password: "" }}
        validationSchema={loginSchema}
        onSubmit={async (values, helpers) => {
          try {
            const res = await fetch("/api/admin/login/", {
              method: "POST",
              headers: { "Content-Type": "application/json", Accept: "application/json" },
              credentials: "same-origin",
              body: JSON.stringify({
                email: values.email.trim(),
                password: values.password,
              }),
            });

            const result = (await res.json().catch(() => null)) as
              | LoginApiResult
              | null;

            if (!result || typeof result !== "object" || !("ok" in result)) {
              const msg = t.auth.loginFailed;
              adminToastError(msg);
              helpers.setStatus(msg);
              return;
            }

            if (!result.ok) {
              adminToastError(result.error);
              helpers.setFieldError("password", result.error);
              helpers.setStatus(result.error);
              return;
            }

            adminToastSuccess(t.auth.success);
            window.location.assign(
              nextPath && nextPath.startsWith("/admin/") ? nextPath : "/admin/",
            );
          } catch (err) {
            const msg = err instanceof Error ? err.message : t.auth.loginFailed;
            adminToastError(msg);
            helpers.setStatus(msg);
          } finally {
            helpers.setSubmitting(false);
          }
        }}
      >
        {({ isSubmitting, status }) => (
          <Form
            style={{
              width: "100%",
              maxWidth: 400,
              display: "grid",
              gap: 16,
              border: "1px solid #333",
              padding: 24,
            }}
          >
            <h1 style={{ fontSize: 24, fontWeight: 500 }}>{t.auth.loginTitle}</h1>
            <FormikTextField
              label={t.common.email}
              name="email"
              type="email"
              autoComplete="username"
              disabled={isSubmitting}
            />
            <FormikTextField
              label={t.common.password}
              name="password"
              type="password"
              autoComplete="current-password"
              disabled={isSubmitting}
            />
            {status ? <p style={{ color: "#f66", fontSize: 14 }}>{status}</p> : null}
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                padding: 12,
                background: "#fff",
                color: "#000",
                border: 0,
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              {isSubmitting ? t.auth.submitting : t.auth.submit}
            </button>
            <a href="/admin/setup/" style={{ color: "#888", fontSize: 13 }}>
              {t.auth.setupLink}
            </a>
          </Form>
        )}
      </Formik>
    </div>
  );
}
