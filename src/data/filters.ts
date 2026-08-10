export const sphereFilters = [
  "Все",
  "Рестораны",
  "Ритейл",
  "Медицина",
  "Образование",
  "Детские товары",
] as const;

export const directionFilters = [
  "Все",
  "Логотип",
  "Брендинг",
  "Фирменный стиль",
] as const;

export type SphereFilter = (typeof sphereFilters)[number];
export type DirectionFilter = (typeof directionFilters)[number];
