export interface ProcessStep {
  number: string;
  title: string;
  description: string;
}

export const processSteps: ProcessStep[] = [
  {
    number: "1.",
    title: "Заявка",
    description: "оставляете запрос, мы связываемся",
  },
  {
    number: "2.",
    title: "Бриф",
    description: "разбираем задачу, изучаем конкурентов",
  },
  {
    number: "3.",
    title: "Концепция",
    description: "2 варианта направления",
  },
  {
    number: "4.",
    title: "Доработка",
    description: "правки до результата",
  },
  {
    number: "5.",
    title: "Передача",
    description: "все исходники ваши",
  },
];
