"use client";

import { HardNavForm } from "@/components/admin/HardNavForm";
import { ImageField } from "@/components/admin/image-field";
import {
  formatUploadError,
  uploadMediaViaApi,
} from "@/lib/cms/browser-upload";
import {
  changePasswordAction,
  saveProfileAction,
} from "@/app/admin/(dashboard)/profile/actions";
import {
  adminBtnPrimary,
  adminInput,
} from "@/components/admin/ui/styles";
import { AdminPageHeader } from "@/components/admin/ui/AdminPageHeader";
import { useAdminT } from "@/i18n/admin";
import { useRef, useState, type CSSProperties } from "react";

type ProfileData = {
  id: string;
  email: string;
  role: "owner" | "editor";
  display_name: string;
  job_title: string;
  bio: string;
  avatar_url: string;
  last_login_at: string | null;
  created_at: string | null;
};

type Props = {
  profile: ProfileData;
  saved?: boolean;
  passwordSaved?: boolean;
};

const fieldset: CSSProperties = {
  border: "1px solid #333",
  padding: 16,
  display: "grid",
  gap: 12,
  background: "#0c0c0c",
  borderRadius: 0,
};

function formatWhen(value: string | null): string {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

export function ProfileEditor({ profile, saved, passwordSaved }: Props) {
  const t = useAdminT();
  const pendingFileRef = useRef<File | null>(null);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url);
  const [displayName, setDisplayName] = useState(profile.display_name);
  const [jobTitle, setJobTitle] = useState(profile.job_title);
  const [bio, setBio] = useState(profile.bio);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  return (
    <div style={{ width: "100%", maxWidth: 720 }}>
      <AdminPageHeader
        title={t.profile.title}
        description={t.profile.description}
      />

      {saved ? (
        <p style={{ color: "#6f6", marginTop: 0 }}>{t.common.saved}.</p>
      ) : null}
      {passwordSaved ? (
        <p style={{ color: "#6f6", marginTop: 0 }}>{t.profile.passwordChanged}.</p>
      ) : null}

      <HardNavForm
        action={async (formData) => {
          const file = pendingFileRef.current;
          if (file) {
            try {
              const uploaded = await uploadMediaViaApi(file, {
                folder: `admins/${profile.id}`,
                filenameHint: "avatar",
              });
              formData.set("avatar_url", uploaded.publicUrl);
              formData.delete("avatar_file");
              pendingFileRef.current = null;
            } catch (err) {
              throw new Error(
                formatUploadError(
                  err instanceof Error ? err.message : t.common.actionFailed,
                  t.common.uploadNetworkError,
                ),
              );
            }
          } else {
            formData.set(
              "avatar_url",
              avatarUrl.startsWith("blob:") ? profile.avatar_url : avatarUrl,
            );
          }
          return saveProfileAction(formData);
        }}
        style={{ display: "grid", gap: 18 }}
      >
        <fieldset style={fieldset}>
          <legend style={{ padding: "0 6px", color: "#aaa", fontSize: 12 }}>
            {t.profile.account}
          </legend>
          <p style={{ margin: 0, fontSize: 13, color: "#ccc" }}>
            <strong style={{ color: "#fff" }}>{t.common.email}:</strong>{" "}
            {profile.email}
          </p>
          <p style={{ margin: 0, fontSize: 13, color: "#ccc" }}>
            <strong style={{ color: "#fff" }}>{t.common.role}:</strong>{" "}
            {t.roles[profile.role]}
          </p>
          <p style={{ margin: 0, fontSize: 12, color: "#666" }}>
            {t.profile.lastLogin}: {formatWhen(profile.last_login_at)}
          </p>
        </fieldset>

        <fieldset style={fieldset}>
          <legend style={{ padding: "0 6px", color: "#aaa", fontSize: 12 }}>
            {t.profile.authorBlock}
          </legend>
          <p style={{ margin: 0, fontSize: 12, color: "#666" }}>
            {t.profile.authorHint}
          </p>

          <label style={{ fontSize: 13 }}>
            {t.profile.displayName}
            <input
              name="display_name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder={t.profile.displayNamePlaceholder}
              style={adminInput}
            />
          </label>

          <label style={{ fontSize: 13 }}>
            {t.profile.jobTitle}
            <input
              name="job_title"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder={t.profile.jobTitlePlaceholder}
              style={adminInput}
            />
          </label>

          <label style={{ fontSize: 13 }}>
            {t.profile.bio}
            <textarea
              name="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              placeholder={t.profile.bioPlaceholder}
              style={{ ...adminInput, resize: "vertical" }}
            />
          </label>

          <input
            type="hidden"
            name="avatar_url"
            value={
              avatarUrl.startsWith("blob:") ? profile.avatar_url : avatarUrl
            }
            readOnly
          />

          <ImageField
            name="avatar_file"
            preset="avatar"
            currentUrl={avatarUrl || null}
            label={t.profile.avatar}
            previewTitle={displayName || profile.email}
            previewSubtitle={jobTitle || t.roles[profile.role]}
            onReady={(file) => {
              pendingFileRef.current = file;
              if (!file) {
                setAvatarUrl(profile.avatar_url);
                return;
              }
              setAvatarUrl(URL.createObjectURL(file));
            }}
          />
        </fieldset>

        <button type="submit" style={{ ...adminBtnPrimary, maxWidth: 220 }}>
          {t.profile.save}
        </button>
      </HardNavForm>

      <HardNavForm
        action={async (formData) => {
          const result = await changePasswordAction(formData);
          if (result && "ok" in result && result.ok) {
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
          }
          return result;
        }}
        style={{ display: "grid", gap: 18, marginTop: 28 }}
        successMessage={t.profile.passwordChanged}
      >
        <fieldset style={fieldset}>
          <legend style={{ padding: "0 6px", color: "#aaa", fontSize: 12 }}>
            {t.profile.passwordSection}
          </legend>
          <p style={{ margin: 0, fontSize: 12, color: "#666" }}>
            {t.profile.passwordHint}
          </p>

          <label style={{ fontSize: 13 }}>
            {t.profile.currentPassword}
            <input
              name="current_password"
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              style={adminInput}
            />
          </label>

          <label style={{ fontSize: 13 }}>
            {t.profile.newPassword}
            <input
              name="new_password"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
              style={adminInput}
            />
          </label>

          <label style={{ fontSize: 13 }}>
            {t.profile.confirmPassword}
            <input
              name="confirm_password"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
              style={adminInput}
            />
          </label>
        </fieldset>

        <button type="submit" style={{ ...adminBtnPrimary, maxWidth: 220 }}>
          {t.profile.savePassword}
        </button>
      </HardNavForm>
    </div>
  );
}
