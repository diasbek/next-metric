import type { AdminMessages } from "@/i18n/admin/types";

const ENTITY_TYPE_KEYS: Record<string, keyof AdminMessages["audit"]> = {
  project: "project",
  projects: "project",
  service: "service",
  services: "service",
  lead: "lead",
  leads: "lead",
  site_settings: "settings",
  settings: "settings",
  metric_admin_users: "user",
  user: "user",
  media: "media",
  team: "team",
  team_member: "team",
  testimonial: "testimonial",
  testimonials: "testimonial",
  faq: "faq",
  agency: "agency",
};

export function auditEntityLabel(
  entityType: string | null | undefined,
  audit: AdminMessages["audit"],
): string {
  if (!entityType) return "";
  const key = ENTITY_TYPE_KEYS[entityType] ?? "unknown";
  return audit[key];
}
