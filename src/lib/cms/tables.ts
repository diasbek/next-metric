/** Canonical Metric CMS table names — all Metric objects use `metric_` prefix. */
export const T = {
  adminUsers: "metric_admin_users",
  adminAuditLog: "metric_admin_audit_log",
  projects: "metric_projects",
  projectTranslations: "metric_project_translations",
  projectBlocks: "metric_project_blocks",
  projectMedia: "metric_project_media",
  tags: "metric_tags",
  tagTranslations: "metric_tag_translations",
  projectTags: "metric_project_tags",
  services: "metric_services",
  serviceTranslations: "metric_service_translations",
  faqItems: "metric_faq_items",
  faqTranslations: "metric_faq_translations",
  teamMembers: "metric_team_members",
  teamMemberTranslations: "metric_team_member_translations",
  testimonials: "metric_testimonials",
  testimonialTranslations: "metric_testimonial_translations",
  agencyContent: "metric_agency_content",
  agencyTranslations: "metric_agency_translations",
  home: "metric_home",
  homeTranslations: "metric_home_translations",
  pageSeo: "metric_page_seo",
  siteSettings: "metric_site_settings",
  siteSettingsTranslations: "metric_site_settings_translations",
  leads: "metric_leads",
} as const;

export type MetricTable = (typeof T)[keyof typeof T];

/** Metric-only storage buckets (Timsol keeps unprefixed lead-attachments / site-files / media). */
export const METRIC_MEDIA_BUCKET = "metric-media" as const;
export const METRIC_LEAD_ATTACHMENTS_BUCKET = "metric-lead-attachments" as const;
export const METRIC_SITE_FILES_BUCKET = "metric-site-files" as const;
