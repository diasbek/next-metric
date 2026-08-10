export interface Service {
  id: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  price: string;
  duration: string;
}

export const services: Service[] = [
  {
    id: "logo",
    title: "Логотип",
    shortDescription: "знак и логотип, который работает на любом носителе",
    fullDescription:
      "Разрабатываем знак и логотип, который работает на любом носителе — от визитки до вывески. 2 концепции на выбор, все исходники в финале.",
    price: "От 8 млн сум",
    duration: "3–5 дней",
  },
  {
    id: "identity",
    title: "Фирменный стиль",
    shortDescription: "визитки, бланки, аватарки, паттерны",
    fullDescription:
      "Логотип плюс визитка, бланк, аватарки, паттерн. Всё, что нужно для единого образа компании.",
    price: "От 12 млн сум",
    duration: "7–10 дней",
  },
  {
    id: "brandbook",
    title: "Брендбук",
    shortDescription: "правила использования бренда в одном документе",
    fullDescription:
      "Полный документ с правилами использования бренда. Цвета, шрифты, отступы, примеры применения — всё в одном месте.",
    price: "От 32 млн сум",
    duration: "14–20 дней",
  },
];
