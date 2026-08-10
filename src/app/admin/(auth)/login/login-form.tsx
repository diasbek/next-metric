"use client";

import { Formik, Form } from "formik";
import { useEffect, useState } from "react";
import { FormikTextField } from "@/components/admin/form/FormikFields";
import {
  adminToastError,
  adminToastSuccess,
} from "@/components/admin/toast/AdminToaster";
import { loginSchema } from "@/lib/cms/admin-schemas";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useAdminT } from "@/i18n/admin";

type AdminLoginFormProps = {
  supabaseUrl: string;
  supabasePublishableKey: string;
  initialError?: string;
  nextPath?: string;
};

export function AdminLoginForm({
  supabaseUrl,
  supabasePublishableKey,
  initialError = "",
  nextPath,
}: AdminLoginFormProps) {
  const t = useAdminT();
  const [bootError] = useState(initialError);
  const ready = Boolean(supabaseUrl && supabasePublishableKey);

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
          if (!ready) {
            adminToastError(t.auth.configMissing);
            return;
          }

          try {
            const supabase = createSupabaseBrowserClient({
              url: supabaseUrl,
              publishableKey: supabasePublishableKey,
            });
            const { error: authError } = await supabase.auth.signInWithPassword({
              email: values.email.trim(),
              password: values.password,
            });
            if (authError) {
              adminToastError(authError.message);
              helpers.setFieldError("password", authError.message);
              return;
            }

            const {
              data: { user },
            } = await supabase.auth.getUser();
            if (!user) {
              await supabase.auth.signOut();
              adminToastError(t.auth.loginFailed);
              helpers.setStatus(t.auth.loginFailed);
              return;
            }

            const { data: admin, error: adminError } = await supabase
              .from("admin_users")
              .select("user_id")
              .eq("user_id", user.id)
              .maybeSingle();

            if (adminError || !admin) {
              await supabase.auth.signOut();
              const msg = adminError?.message ?? t.auth.notAdmin;
              adminToastError(msg);
              helpers.setStatus(msg);
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
            {!ready ? (
              <p style={{ color: "#f66", fontSize: 14 }}>{t.auth.configMissing}</p>
            ) : null}
            <FormikTextField
              label={t.common.email}
              name="email"
              type="email"
              autoComplete="username"
              disabled={!ready || isSubmitting}
            />
            <FormikTextField
              label={t.common.password}
              name="password"
              type="password"
              autoComplete="current-password"
              disabled={!ready || isSubmitting}
            />
            {status ? <p style={{ color: "#f66", fontSize: 14 }}>{status}</p> : null}
            <button
              type="submit"
              disabled={isSubmitting || !ready}
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
