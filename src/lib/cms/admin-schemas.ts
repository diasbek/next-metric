import * as Yup from "yup";

export const ADMIN_LOCALES = ["ru", "uz", "en"] as const;
export type AdminLocaleCode = (typeof ADMIN_LOCALES)[number];

const optionalTrimmed = Yup.string().trim().default("");

export const statusSchema = Yup.mixed<"draft" | "published">()
  .oneOf(["draft", "published"])
  .required("Выберите статус");

export const sortOrderSchema = Yup.number()
  .transform((_value, original) => {
    if (original === "" || original === null || original === undefined) {
      return undefined;
    }
    return Number(original);
  })
  .typeError("Порядок должен быть числом")
  .integer("Порядок — целое число")
  .min(0, "Порядок не может быть отрицательным")
  .max(9999, "Порядок слишком большой")
  .required("Укажите порядок");

export const requiredLabel = (label: string) =>
  Yup.string().trim().required(`Заполните поле «${label}»`);

/** Team member — RU is required when publishing. */
export const teamMemberSchema = Yup.object({
  status: statusSchema,
  sort_order: sortOrderSchema,
  is_director: Yup.boolean().default(false),
  image_object_position: optionalTrimmed,
  ru_name: Yup.string().trim().when("status", {
    is: "published",
    then: (s) => s.required("Имя (RU) обязательно для публикации"),
    otherwise: (s) => s.default(""),
  }),
  ru_role: Yup.string().trim().when("status", {
    is: "published",
    then: (s) => s.required("Роль (RU) обязательна для публикации"),
    otherwise: (s) => s.default(""),
  }),
  uz_name: optionalTrimmed,
  uz_role: optionalTrimmed,
  en_name: optionalTrimmed,
  en_role: optionalTrimmed,
});

export type TeamMemberFormValues = Yup.InferType<typeof teamMemberSchema>;

export const faqItemSchema = Yup.object({
  status: statusSchema,
  sort_order: sortOrderSchema,
  ru_question: Yup.string().trim().when("status", {
    is: "published",
    then: (s) => s.required("Вопрос (RU) обязателен"),
    otherwise: (s) => s.default(""),
  }),
  ru_answer: Yup.string().trim().when("status", {
    is: "published",
    then: (s) => s.required("Ответ (RU) обязателен"),
    otherwise: (s) => s.default(""),
  }),
  uz_question: optionalTrimmed,
  uz_answer: optionalTrimmed,
  en_question: optionalTrimmed,
  en_answer: optionalTrimmed,
});

export const serviceSchema = Yup.object({
  status: statusSchema,
  sort_order: sortOrderSchema,
  service_key: Yup.string()
    .trim()
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Ключ: латиница, цифры и дефисы")
    .required("Укажите service_key"),
  ru_title: Yup.string().trim().when("status", {
    is: "published",
    then: (s) => s.required("Название (RU) обязательно"),
    otherwise: (s) => s.default(""),
  }),
  ru_short: optionalTrimmed,
  ru_full: optionalTrimmed,
  ru_price: optionalTrimmed,
  ru_duration: optionalTrimmed,
  uz_title: optionalTrimmed,
  uz_short: optionalTrimmed,
  uz_full: optionalTrimmed,
  uz_price: optionalTrimmed,
  uz_duration: optionalTrimmed,
  en_title: optionalTrimmed,
  en_short: optionalTrimmed,
  en_full: optionalTrimmed,
  en_price: optionalTrimmed,
  en_duration: optionalTrimmed,
});

export const processStepSchema = Yup.object({
  status: statusSchema,
  sort_order: sortOrderSchema,
  step_number: Yup.string().trim().required("Укажите номер шага"),
  ru_title: Yup.string().trim().when("status", {
    is: "published",
    then: (s) => s.required("Заголовок (RU) обязателен"),
    otherwise: (s) => s.default(""),
  }),
  ru_description: optionalTrimmed,
  uz_title: optionalTrimmed,
  uz_description: optionalTrimmed,
  en_title: optionalTrimmed,
  en_description: optionalTrimmed,
});

export const benefitSchema = Yup.object({
  status: statusSchema,
  sort_order: sortOrderSchema,
  ru_label: Yup.string().trim().when("status", {
    is: "published",
    then: (s) => s.required("Текст (RU) обязателен"),
    otherwise: (s) => s.default(""),
  }),
  uz_label: optionalTrimmed,
  en_label: optionalTrimmed,
});

export const testimonialSchema = Yup.object({
  status: statusSchema,
  sort_order: sortOrderSchema,
  person_object_position: optionalTrimmed,
  logo_rounded: Yup.mixed<"" | "full" | "lg">()
    .oneOf(["", "full", "lg"])
    .default(""),
  ru_role: optionalTrimmed,
  ru_quote: Yup.string().trim().when("status", {
    is: "published",
    then: (s) => s.required("Цитата (RU) обязательна"),
    otherwise: (s) => s.default(""),
  }),
  uz_role: optionalTrimmed,
  uz_quote: optionalTrimmed,
  en_role: optionalTrimmed,
  en_quote: optionalTrimmed,
});

const contactsLocaleSchema = Yup.object({
  address_lines: Yup.string().trim().required("Укажите адрес"),
  presentation_url: optionalTrimmed,
  brief_url: optionalTrimmed,
});

export const contactsSchema = Yup.object({
  phone: Yup.string().trim().required("Укажите телефон"),
  email: Yup.string().trim().email("Некорректный email").default(""),
  telegram_url: Yup.string()
    .trim()
    .transform((v) => (v ? v : undefined))
    .url("Некорректный URL Telegram")
    .notRequired(),
  instagram_url: Yup.string()
    .trim()
    .transform((v) => (v ? v : undefined))
    .url("Некорректный URL Instagram")
    .notRequired(),
  ru: contactsLocaleSchema,
  uz: contactsLocaleSchema,
  en: contactsLocaleSchema,
});

export const loginSchema = Yup.object({
  email: Yup.string().trim().email("Некорректный email").required("Введите email"),
  password: Yup.string().min(1, "Введите пароль").required("Введите пароль"),
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
