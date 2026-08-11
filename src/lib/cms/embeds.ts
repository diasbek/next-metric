/**
 * PostgREST embed aliases for Metric translation tables.
 * Unprefixed names resolve to Timsol tables on the shared minim project.
 */
export const EMBED = {
  serviceTranslations: "service_translations:metric_service_translations(*)",
  faqTranslations: "faq_translations:metric_faq_translations(*)",
  teamMemberTranslations:
    "team_member_translations:metric_team_member_translations(*)",
  testimonialTranslations:
    "testimonial_translations:metric_testimonial_translations(*)",
  projectTranslations:
    "project_translations:metric_project_translations(locale, title)",
  processStepTranslations:
    "process_step_translations:metric_process_step_translations(*)",
  benefitTranslations: "benefit_translations:metric_benefit_translations(*)",
} as const;
