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
    id: "product-images",
    title: "Product images",
    shortDescription: "Main and secondary Amazon listing images that sell",
    fullDescription:
      "Strategic Amazon listing images designed to communicate value, inspire confidence, and turn attention into sales.",
    price: "Custom",
    duration: "7–14 days",
  },
  {
    id: "aplus",
    title: "A+ Content",
    shortDescription: "Premium A+ modules that deepen the story",
    fullDescription:
      "A+ and Premium A+ Content that clarifies benefits and builds brand trust on the product detail page.",
    price: "Custom",
    duration: "7–14 days",
  },
  {
    id: "ad-banner",
    title: "Ad-Banner",
    shortDescription: "Advertising creatives aligned with your listing",
    fullDescription:
      "Ad banners and campaign creatives built as one consistent visual system with your listing.",
    price: "Custom",
    duration: "5–10 days",
  },
  {
    id: "brandstore",
    title: "BrandStore",
    shortDescription: "Amazon Brand Store experiences",
    fullDescription:
      "Brand Store design that extends your listing system into a full Amazon brand destination.",
    price: "Custom",
    duration: "10–20 days",
  },
];
