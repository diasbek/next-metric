import type { CSSProperties, ReactNode } from "react";
import type { AdminNavLabelKey } from "@/components/admin/chrome/nav";

type IconProps = {
  size?: number;
  strokeWidth?: number;
  style?: CSSProperties;
  className?: string;
};

function IconShell({
  size = 18,
  strokeWidth = 1.75,
  style,
  className,
  children,
}: IconProps & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
      style={{ display: "block", flexShrink: 0, ...style }}
    >
      {children}
    </svg>
  );
}

export function IconOverview(props: IconProps) {
  return (
    <IconShell {...props}>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </IconShell>
  );
}

export function IconHome(props: IconProps) {
  return (
    <IconShell {...props}>
      <path d="M4 10.5 12 4l8 6.5" />
      <path d="M6.5 9.5V20h11V9.5" />
    </IconShell>
  );
}

export function IconAgency(props: IconProps) {
  return (
    <IconShell {...props}>
      <path d="M3 21h18" />
      <path d="M5 21V7l7-4 7 4v14" />
      <path d="M9 21v-6h6v6" />
      <path d="M9 10h.01M12 10h.01M15 10h.01M9 14h.01M12 14h.01M15 14h.01" />
    </IconShell>
  );
}

export function IconWorks(props: IconProps) {
  return (
    <IconShell {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 9h18" />
      <path d="M8 5v4M16 5v4" />
    </IconShell>
  );
}

export function IconTags(props: IconProps) {
  return (
    <IconShell {...props}>
      <path d="M20.6 13.4 12.7 21.3a2 2 0 0 1-2.8 0L2.7 14.1a2 2 0 0 1 0-2.8l7.9-7.9A2 2 0 0 1 12 3h6.5A2.5 2.5 0 0 1 21 5.5V12a2 2 0 0 1-.4 1.4Z" />
      <circle cx="16" cy="8" r="1.2" fill="currentColor" stroke="none" />
    </IconShell>
  );
}

export function IconTeam(props: IconProps) {
  return (
    <IconShell {...props}>
      <circle cx="12" cy="7" r="2.6" />
      <path d="M7 18.5a5 5 0 0 1 10 0" />
      <circle cx="5.5" cy="9.5" r="2" />
      <path d="M2 18.5a3.8 3.8 0 0 1 5.2-3.5" />
      <circle cx="18.5" cy="9.5" r="2" />
      <path d="M16.8 15a3.8 3.8 0 0 1 5.2 3.5" />
    </IconShell>
  );
}

export function IconTestimonials(props: IconProps) {
  return (
    <IconShell {...props}>
      <path d="M4 6.5A2.5 2.5 0 0 1 6.5 4H10v6.5A2.5 2.5 0 0 1 7.5 13H6v3l-2-2.5V6.5Z" />
      <path d="M14 6.5A2.5 2.5 0 0 1 16.5 4H20v6.5A2.5 2.5 0 0 1 17.5 13H16v3l-2-2.5V6.5Z" />
    </IconShell>
  );
}

export function IconServices(props: IconProps) {
  return (
    <IconShell {...props}>
      <path d="M14.7 6.3a4.5 4.5 0 0 0-6.1 6.1L4 17l3 3 4.6-4.6a4.5 4.5 0 0 0 6.1-6.1Z" />
      <path d="m12 9 1.5-1.5M15 12l1.5-1.5" />
    </IconShell>
  );
}

export function IconContacts(props: IconProps) {
  return (
    <IconShell {...props}>
      <path d="M22 16.9v2.2a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.7A2 2 0 0 1 4.1 1h2.2a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.6a2 2 0 0 1-.5 2.1L7.1 8.7a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.8.3 1.7.5 2.6.6a2 2 0 0 1 1.7 2.1Z" />
    </IconShell>
  );
}

export function IconLeads(props: IconProps) {
  return (
    <IconShell {...props}>
      <path d="M4 4h16v12H7l-3 3V4Z" />
      <path d="M8 9h8M8 13h5" />
    </IconShell>
  );
}

export function IconMedia(props: IconProps) {
  return (
    <IconShell {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <circle cx="9" cy="11" r="2" />
      <path d="m21 16-4.5-4.5L11 17" />
    </IconShell>
  );
}

export function IconUsers(props: IconProps) {
  return (
    <IconShell {...props}>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3.5 19a5.5 5.5 0 0 1 11 0" />
      <circle cx="17" cy="9" r="2.4" />
      <path d="M15.2 19a4.2 4.2 0 0 1 5.3-3.6" />
    </IconShell>
  );
}

export function IconSettings(props: IconProps) {
  return (
    <IconShell {...props}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.1 5.1l1.6 1.6M17.3 17.3l1.6 1.6M18.9 5.1l-1.6 1.6M6.7 17.3l-1.6 1.6" />
    </IconShell>
  );
}

export function IconProfile(props: IconProps) {
  return (
    <IconShell {...props}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20a7 7 0 0 1 14 0" />
    </IconShell>
  );
}

export function IconMore(props: IconProps) {
  return (
    <IconShell {...props}>
      <circle cx="5" cy="12" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="19" cy="12" r="1.4" fill="currentColor" stroke="none" />
    </IconShell>
  );
}

export function IconNotifications(props: IconProps) {
  return (
    <IconShell {...props}>
      <path d="M6 9a6 6 0 1 1 12 0c0 3.5 1.5 5 2.5 6.5H3.5C4.5 14 6 12.5 6 9Z" />
      <path d="M10 19a2 2 0 0 0 4 0" />
    </IconShell>
  );
}

const BY_KEY: Record<AdminNavLabelKey, (props: IconProps) => ReactNode> = {
  overview: IconOverview,
  home: IconHome,
  agency: IconAgency,
  works: IconWorks,
  tags: IconTags,
  team: IconTeam,
  testimonials: IconTestimonials,
  services: IconServices,
  contacts: IconContacts,
  leads: IconLeads,
  media: IconMedia,
  profile: IconProfile,
  users: IconUsers,
  settings: IconSettings,
};

export function AdminNavIcon({
  labelKey,
  size = 18,
  ...rest
}: IconProps & { labelKey: AdminNavLabelKey }) {
  const Comp = BY_KEY[labelKey];
  return <Comp size={size} {...rest} />;
}
