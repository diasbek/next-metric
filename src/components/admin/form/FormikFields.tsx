"use client";

import { useField } from "formik";
import type { CSSProperties, InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { adminInput } from "@/components/admin/ui/styles";

const labelStyle: CSSProperties = {
  display: "grid",
  gap: 4,
  fontSize: 13,
};

const errorStyle: CSSProperties = {
  color: "#f66",
  fontSize: 12,
  marginTop: 4,
};

type FieldShellProps = {
  label: string;
  name: string;
  hint?: string;
  children: ReactNode;
};

function FieldShell({ label, name, hint, children }: FieldShellProps) {
  const [, meta] = useField(name);
  const showError = meta.touched && meta.error;
  return (
    <label style={labelStyle}>
      {label}
      {children}
      {hint && !showError ? (
        <span style={{ color: "#666", fontSize: 12 }}>{hint}</span>
      ) : null}
      {showError ? <span style={errorStyle}>{meta.error}</span> : null}
    </label>
  );
}

type TextProps = {
  label: string;
  name: string;
  hint?: string;
} & InputHTMLAttributes<HTMLInputElement>;

export function FormikTextField({ label, name, hint, style, ...rest }: TextProps) {
  const [field, meta] = useField(name);
  return (
    <FieldShell label={label} name={name} hint={hint}>
      <input
        {...field}
        {...rest}
        name={name}
        style={{
          ...adminInput,
          borderColor: meta.touched && meta.error ? "#933" : undefined,
          ...style,
        }}
      />
    </FieldShell>
  );
}

type AreaProps = {
  label: string;
  name: string;
  hint?: string;
} & TextareaHTMLAttributes<HTMLTextAreaElement>;

export function FormikTextArea({ label, name, hint, style, ...rest }: AreaProps) {
  const [field, meta] = useField(name);
  return (
    <FieldShell label={label} name={name} hint={hint}>
      <textarea
        {...field}
        {...rest}
        name={name}
        style={{
          ...adminInput,
          minHeight: 96,
          borderColor: meta.touched && meta.error ? "#933" : undefined,
          ...style,
        }}
      />
    </FieldShell>
  );
}

type SelectProps = {
  label: string;
  name: string;
  hint?: string;
  children: ReactNode;
} & SelectHTMLAttributes<HTMLSelectElement>;

export function FormikSelect({ label, name, hint, children, style, ...rest }: SelectProps) {
  const [field, meta] = useField(name);
  return (
    <FieldShell label={label} name={name} hint={hint}>
      <select
        {...field}
        {...rest}
        name={name}
        style={{
          ...adminInput,
          borderColor: meta.touched && meta.error ? "#933" : undefined,
          ...style,
        }}
      >
        {children}
      </select>
    </FieldShell>
  );
}

type CheckboxProps = {
  label: string;
  name: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "type">;

export function FormikCheckbox({ label, name, ...rest }: CheckboxProps) {
  const [field, meta] = useField({ name, type: "checkbox" });
  return (
    <label
      style={{
        display: "flex",
        gap: 10,
        alignItems: "center",
        fontSize: 13,
        cursor: "pointer",
      }}
    >
      <input {...field} {...rest} type="checkbox" name={name} checked={Boolean(field.value)} />
      <span>{label}</span>
      {meta.touched && meta.error ? (
        <span style={errorStyle}>{meta.error}</span>
      ) : null}
    </label>
  );
}
