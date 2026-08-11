import { HardNavForm } from "@/components/admin/HardNavForm";
import { requireOwner } from "@/lib/cms/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { adminBtn, adminBtnPrimary, adminInput } from "@/components/admin/ui/styles";
import { getAdminMessages } from "@/i18n/admin";
import { getAdminUiLocale } from "@/i18n/admin/get-admin-locale";
import {
  changeAdminRoleAction,
  inviteAdminAction,
  resetAdminPasswordAction,
  revokeAdminAction,
} from "./actions";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requireOwner();
  const uiLocale = await getAdminUiLocale();
  const t = getAdminMessages(uiLocale);
  const params = await searchParams;
  const supabase = createSupabaseAdminClient();
  const { data: users, error: usersError } = await supabase
    .from("metric_admin_users")
    .select("user_id, email, role, created_at, last_login_at")
    .order("created_at", { ascending: true });

  const flash =
    usersError
      ? `Error: ${usersError.message}`
      : params.ok === "invited"
      ? t.users.flashInvited
      : params.ok === "role"
        ? t.users.flashRole
        : params.ok === "revoked"
          ? t.users.flashRevoked
          : params.ok === "password"
            ? t.users.flashPassword
            : params.error === "last-owner"
              ? t.users.flashLastOwner
              : params.error === "self"
                ? t.users.flashSelf
                : params.error
                  ? `Error: ${params.error}`
                  : "";

  const th = {
    textAlign: "left" as const,
    padding: "10px 12px",
    fontSize: 11,
    letterSpacing: "0.06em",
    textTransform: "uppercase" as const,
    color: "#777",
    borderBottom: "1px solid #2a2a2a",
    fontWeight: 500,
    whiteSpace: "nowrap" as const,
  };

  const td = {
    padding: "14px 12px",
    borderBottom: "1px solid #1f1f1f",
    verticalAlign: "middle" as const,
    fontSize: 14,
  };

  return (
    <div style={{ display: "grid", gap: 28, width: "100%" }}>
      <div>
        <h1 style={{ fontSize: 32, margin: 0 }}>{t.users.title}</h1>
        <p style={{ color: "#888", margin: "8px 0 0" }}>{t.users.description}</p>
        {flash ? (
          <p
            style={{
              color: params.error || usersError ? "#f66" : "#6f6",
              margin: "12px 0 0",
            }}
          >
            {flash}
          </p>
        ) : null}
      </div>

      <HardNavForm
        action={inviteAdminAction}
        style={{
          border: "1px solid #333",
          padding: 18,
          display: "grid",
          gap: 14,
          width: "100%",
        }}
      >
        <h2 style={{ fontSize: 16, margin: 0, fontWeight: 600 }}>{t.users.inviteTitle}</h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 12,
            alignItems: "end",
          }}
        >
          <label style={{ fontSize: 13 }}>
            {t.common.email}
            <input name="email" type="email" required style={adminInput} />
          </label>
          <label style={{ fontSize: 13 }}>
            {t.users.tempPassword}
            <input
              name="password"
              type="password"
              required
              minLength={8}
              style={adminInput}
            />
          </label>
          <label style={{ fontSize: 13 }}>
            {t.common.role}
            <select name="role" defaultValue="editor" style={adminInput}>
              <option value="editor">{t.roles.editor}</option>
              <option value="owner">{t.roles.owner}</option>
            </select>
          </label>
          <button
            type="submit"
            style={{ ...adminBtnPrimary, height: 42, marginTop: 6 }}
          >
            {t.users.createAdmin}
          </button>
        </div>
      </HardNavForm>

      <div
        style={{
          border: "1px solid #333",
          width: "100%",
          overflowX: "auto",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            minWidth: 720,
          }}
        >
          <thead>
            <tr style={{ background: "#111" }}>
              <th style={th}>{t.common.email}</th>
              <th style={th}>{t.common.role}</th>
              <th style={th}>{t.users.joined}</th>
              <th style={th}>{t.users.lastLogin}</th>
              <th style={{ ...th, minWidth: 420 }}>{t.users.actions}</th>
            </tr>
          </thead>
          <tbody>
            {(users ?? []).length === 0 ? (
              <tr>
                <td colSpan={5} style={{ ...td, color: "#888" }}>
                  {t.users.empty}
                </td>
              </tr>
            ) : (
              (users ?? []).map((user) => (
                <tr key={user.user_id}>
                  <td style={td}>
                    <strong style={{ fontWeight: 500 }}>{user.email}</strong>
                  </td>
                  <td style={td}>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "3px 8px",
                        border: "1px solid #333",
                        fontSize: 12,
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                        color: user.role === "owner" ? "#b8f" : "#ccc",
                      }}
                    >
                      {user.role === "owner" ? t.roles.owner : t.roles.editor}
                    </span>
                  </td>
                  <td style={{ ...td, color: "#aaa", whiteSpace: "nowrap" }}>
                    {new Date(user.created_at).toLocaleDateString(uiLocale)}
                  </td>
                  <td style={{ ...td, color: "#aaa", whiteSpace: "nowrap" }}>
                    {user.last_login_at
                      ? new Date(user.last_login_at).toLocaleString(uiLocale)
                      : "—"}
                  </td>
                  <td style={td}>
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 8,
                        alignItems: "center",
                      }}
                    >
                      <HardNavForm
                        action={changeAdminRoleAction}
                        style={{ display: "flex", gap: 6, alignItems: "center" }}
                      >
                        <input type="hidden" name="user_id" value={user.user_id} />
                        <select
                          name="role"
                          defaultValue={user.role}
                          style={{
                            ...adminInput,
                            marginTop: 0,
                            width: "auto",
                            minWidth: 110,
                          }}
                        >
                          <option value="editor">{t.roles.editor}</option>
                          <option value="owner">{t.roles.owner}</option>
                        </select>
                        <button type="submit" style={adminBtn}>
                          {t.users.setRole}
                        </button>
                      </HardNavForm>

                      <HardNavForm
                        action={resetAdminPasswordAction}
                        style={{
                          display: "flex",
                          gap: 6,
                          alignItems: "center",
                          flex: 1,
                        }}
                      >
                        <input type="hidden" name="user_id" value={user.user_id} />
                        <input
                          name="password"
                          type="password"
                          placeholder={t.users.newPassword}
                          minLength={8}
                          required
                          style={{
                            ...adminInput,
                            marginTop: 0,
                            minWidth: 140,
                            flex: 1,
                          }}
                        />
                        <button type="submit" style={adminBtn}>
                          {t.users.reset}
                        </button>
                      </HardNavForm>

                      <HardNavForm action={revokeAdminAction}>
                        <input type="hidden" name="user_id" value={user.user_id} />
                        <button
                          type="submit"
                          style={{
                            ...adminBtn,
                            color: "#f66",
                            borderColor: "#533",
                          }}
                        >
                          {t.users.revoke}
                        </button>
                      </HardNavForm>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
