/** Canonical Metric CMS table names (content uses `metric_` prefix; auth does not). */
export const T = {
  adminUsers: "admin_users",
  adminAuditLog: "admin_audit_log",
  projects: "metric_projects",
  projectTranslations: "metric_project_translations",
  projectBlocks: "metric_project_blocks",
  projectMedia: "metric_project_media",
  services: "metric_services",
  serviceTranslations: "metric_service_translations",
  faqItems: "metric_faq_items",
  faqTranslations: "metric_faq_translations",
  processSteps: "metric_process_steps",
  processStepTranslations: "metric_process_step_translations",
  benefits: "metric_benefits",
  benefitTranslations: "metric_benefit_translations",
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

/** Public storage bucket for Metric CMS media. */
export const METRIC_MEDIA_BUCKET = "metric-media" as const;
