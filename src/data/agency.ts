export const agencyAbout = {
  title: "Брендинговая студия из Ташкента.",
  paragraphs: [
    "Мы помогаем бизнесу выглядеть профессионально с первого взгляда.",
    "Работаем с малым и средним бизнесом — от стартапов до сетевых компаний.",
    "Каждый проект начинается с понимания: кто ваш клиент, чем вы отличаетесь, что должен почувствовать человек, увидев ваш бренд.",
    "Логотип для нас — не картинка. Это инструмент, который работает на вас каждый день.",
  ],
};

export const agencyFoundedYear = "2019";

export const agencyStats = [
  { value: "6+", label: "лет опыта" },
  { value: "15", label: "дней поддержки после сдачи" },
  { value: "80+", label: "проектов" },
  { value: "3", label: "направления" },
];

export const agencyDirector = {
  name: "Лазизхужа Шарипов",
  role: "Директор",
  image: "/images/agency/team/director.webp",
};

export const agencyTeam = [
  {
    name: "Тахир",
    role: "Зам.директора",
    image: "/images/agency/team/tahir.webp",
  },
  {
    name: "Гульёра",
    role: "Бренд-дизайнер",
    image: "/images/agency/team/gulyora.webp",
  },
  {
    name: "Камиль",
    role: "Бренд-дизайнер",
    image: "/images/agency/team/kamil.webp",
  },
  {
    name: "Азиз",
    role: "Технический дизайнер",
    image: "/images/agency/team/aziz.webp",
  },
  {
    name: "Мухриддин",
    role: "art director",
    image: "/images/agency/team/mukhriddin.webp",
  },
  {
    name: "Рисолат",
    role: "СММ специалист",
    image: "/images/agency/team/risolat.webp",
  },
];

export interface Testimonial {
  role: string;
  quote: string;
  personImage: string;
  personObjectPosition?: string;
  logoImage: string;
  logoRounded?: "full" | "lg";
}

export const agencyTestimonials: Testimonial[] = [
  {
    role: "Основатель, Magic Toys",
    quote:
      "Ребята вникли в задачу с первого брифа. Логотип получился именно таким, каким я его представлял.",
    personImage: "/images/agency/testimonials/magic-toys-person.webp",
    personObjectPosition: "55% 18%",
    logoImage: "/images/agency/testimonials/magic-toys-logo.webp",
    logoRounded: "full",
  },
  {
    role: "Владелец, Kidi Mart",
    quote:
      "До METRIC у нас не было никакого фирменного стиля. После — клиенты стали воспринимать нас совсем иначе.",
    personImage: "/images/agency/testimonials/kidi-person.webp",
    personObjectPosition: "50% 12%",
    logoImage: "/images/agency/testimonials/kidi-logo.webp",
    logoRounded: "lg",
  },
  {
    role: "Руководитель, Murad",
    quote: "Профессионально, по договору, в срок. Рекомендую.",
    personImage: "/images/agency/testimonials/murad-person.webp",
    personObjectPosition: "68% 22%",
    logoImage: "/images/agency/testimonials/murad-logo.webp",
    logoRounded: "full",
  },
];
