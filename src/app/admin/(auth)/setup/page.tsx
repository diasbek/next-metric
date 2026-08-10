import { HardNavForm } from "@/components/admin/HardNavForm";
import { redirect } from "next/navigation";
import { bootstrapAdminAction, canBootstrapAdmin } from "./actions";
import { getEnv } from "@/utils/env";
import { getAdminMessages } from "@/i18n/admin/get-admin-messages";
import { getAdminUiLocale } from "@/i18n/admin/get-admin-locale";

export default async function AdminSetupPage() {
  if (!(await canBootstrapAdmin())) {
    if (!getEnv("CMS_BOOTSTRAP_SECRET", "SETUP_SECRET")) {
      redirect("/admin/login/?error=setup-locked");
    }
    redirect("/admin/login/");
  }

  const t = getAdminMessages(await getAdminUiLocale());

  const input = {
    width: "100%",
    padding: 12,
    background: "#111",
    border: "1px solid #333",
    color: "#fff",
    marginTop: 8,
  } as const;

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
      <HardNavForm
        action={bootstrapAdminAction}
        style={{
          width: "100%",
          maxWidth: 420,
          display: "grid",
          gap: 16,
          border: "1px solid #333",
          padding: 28,
        }}
      >
        <div>
          <h1 style={{ fontSize: 28, marginBottom: 8 }}>{t.auth.setupTitle}</h1>
          <p style={{ color: "#888", fontSize: 14, margin: 0 }}>{t.auth.setupHint}</p>
        </div>
        <label>
          {t.auth.bootstrapSecret}
          <input
            name="bootstrap_secret"
            type="password"
            required
            autoComplete="off"
            style={input}
          />
        </label>
        <label>
          {t.common.email}
          <input name="email" type="email" required autoComplete="username" style={input} />
        </label>
        <label>
          {t.common.password}
          <input
            name="password"
            type="password"
            required
            minLength={8}
            maxLength={128}
            autoComplete="new-password"
            style={input}
          />
        </label>
        <button
          type="submit"
          style={{
            padding: 12,
            background: "#fff",
            color: "#000",
            border: 0,
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          {t.auth.createOwner}
        </button>
      </HardNavForm>
    </div>
  );
}
