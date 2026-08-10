import * as Yup from "yup";

export const ADMIN_LOCALES = ["en", "de"] as const;
export type AdminLocaleCode = (typeof ADMIN_LOCALES)[number];

const optionalTrimmed = Yup.string().trim().default("");

export const statusSchema = Yup.mixed<"draft" | "published">()
  .oneOf(["draft", "published"])
  .required("Select a status");

export const sortOrderSchema = Yup.number()
  .transform((_value, original) => {
    if (original === "" || original === null || original === undefined) {
      return undefined;
    }
    return Number(original);
  })
  .typeError("Order must be a number")
  .integer("Order must be an integer")
  .min(0, "Order cannot be negative")
  .max(9999, "Order is too large")
  .required("Enter an order");

export const requiredLabel = (label: string) =>
  Yup.string().trim().required(`Fill in “${label}”`);

/** Team member — EN is required when publishing. */
export const teamMemberSchema = Yup.object({
  status: statusSchema,
  sort_order: sortOrderSchema,
  is_director: Yup.boolean().default(false),
  image_object_position: optionalTrimmed,
  en_name: Yup.string().trim().when("status", {
    is: "published",
    then: (s) => s.required("Name (EN) is required to publish"),
    otherwise: (s) => s.default(""),
  }),
  en_role: Yup.string().trim().when("status", {
    is: "published",
    then: (s) => s.required("Role (EN) is required to publish"),
    otherwise: (s) => s.default(""),
  }),
  de_name: optionalTrimmed,
  de_role: optionalTrimmed,
});

export type TeamMemberFormValues = Yup.InferType<typeof teamMemberSchema>;

export const faqItemSchema = Yup.object({
  status: statusSchema,
  sort_order: sortOrderSchema,
  en_question: Yup.string().trim().when("status", {
    is: "published",
    then: (s) => s.required("Question (EN) is required"),
    otherwise: (s) => s.default(""),
  }),
  en_answer: Yup.string().trim().when("status", {
    is: "published",
    then: (s) => s.required("Answer (EN) is required"),
    otherwise: (s) => s.default(""),
  }),
  de_question: optionalTrimmed,
  de_answer: optionalTrimmed,
});

export const serviceSchema = Yup.object({
  status: statusSchema,
  sort_order: sortOrderSchema,
  service_key: Yup.string()
    .trim()
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Key: lowercase letters, numbers, hyphens")
    .required("Enter service_key"),
  en_title: Yup.string().trim().when("status", {
    is: "published",
    then: (s) => s.required("Title (EN) is required"),
    otherwise: (s) => s.default(""),
  }),
  en_short: optionalTrimmed,
  en_full: optionalTrimmed,
  en_price: optionalTrimmed,
  en_duration: optionalTrimmed,
  de_title: optionalTrimmed,
  de_short: optionalTrimmed,
  de_full: optionalTrimmed,
  de_price: optionalTrimmed,
  de_duration: optionalTrimmed,
});

export const processStepSchema = Yup.object({
  status: statusSchema,
  sort_order: sortOrderSchema,
  step_number: Yup.string().trim().required("Enter step number"),
  en_title: Yup.string().trim().when("status", {
    is: "published",
    then: (s) => s.required("Title (EN) is required"),
    otherwise: (s) => s.default(""),
  }),
  en_description: optionalTrimmed,
  de_title: optionalTrimmed,
  de_description: optionalTrimmed,
});

export const benefitSchema = Yup.object({
  status: statusSchema,
  sort_order: sortOrderSchema,
  en_label: Yup.string().trim().when("status", {
    is: "published",
    then: (s) => s.required("Text (EN) is required"),
    otherwise: (s) => s.default(""),
  }),
  de_label: optionalTrimmed,
});

export const testimonialSchema = Yup.object({
  status: statusSchema,
  sort_order: sortOrderSchema,
  person_object_position: optionalTrimmed,
  logo_rounded: Yup.mixed<"" | "full" | "lg">()
    .oneOf(["", "full", "lg"])
    .default(""),
  en_role: optionalTrimmed,
  en_quote: Yup.string().trim().when("status", {
    is: "published",
    then: (s) => s.required("Quote (EN) is required"),
    otherwise: (s) => s.default(""),
  }),
  de_role: optionalTrimmed,
  de_quote: optionalTrimmed,
});

const contactsLocaleSchema = Yup.object({
  address_lines: Yup.string().trim().required("Enter an address"),
  presentation_url: optionalTrimmed,
  brief_url: optionalTrimmed,
});

export const contactsSchema = Yup.object({
  phone: Yup.string().trim().required("Enter a phone number"),
  email: Yup.string().trim().email("Invalid email").default(""),
  telegram_url: Yup.string()
    .trim()
    .transform((v) => (v ? v : undefined))
    .url("Invalid Telegram URL")
    .notRequired(),
  instagram_url: Yup.string()
    .trim()
    .transform((v) => (v ? v : undefined))
    .url("Invalid Instagram URL")
    .notRequired(),
  en: contactsLocaleSchema,
  de: contactsLocaleSchema,
});

export const loginSchema = Yup.object({
  email: Yup.string().trim().email("Invalid email").required("Enter email"),
  password: Yup.string().min(1, "Enter password").required("Enter password"),
});

export function yupToFieldErrors(
  err: Yup.ValidationError,
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of err.inner.length ? err.inner : [err]) {
    if (issue.path && !out[issue.path]) {
      out[issue.path] = issue.message;
    }
  }
  return out;
}
