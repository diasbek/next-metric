export const metricHome = {
  hero: {
    title: "On Amazon, customers buy with their eyes first.",
    subtitle:
      "Strategic Amazon listing images and A+ Content designed to communicate value, inspire confidence, and turn attention into sales.",
    cta: "Build a Stronger Listing",
    badge: "9.5%",
    product1: "/images/metric/hero/product-1.jpg",
    product2: "/images/metric/hero/product-2.jpg",
    glow: "/images/metric/hero/glow.png",
  },
  trust: [
    {
      kind: "spn" as const,
      label: "Official Service-Partner",
      text: "We are an official partner in the Amazon Service Provider Network (SPN).",
      icon: "/images/metric/icons/spn.svg",
    },
    {
      kind: "reviews" as const,
      label: "Based on verified client reviews",
      icon: "/images/metric/icons/trustpilot.svg",
    },
    {
      kind: "rating" as const,
      value: "5",
      label: "Excellent 5.0 out of 5",
      icon: "/images/metric/icons/star.svg",
    },
    {
      kind: "stat" as const,
      value: "800+",
      label: "Sellers served",
    },
  ],
  categories: {
    titleBefore: "We help turn products into Amazon ",
    titleAccent: "bestsellers",
    titleAfter: " across categories.",
    images: [
      "/images/metric/categories/cat-1.jpg",
      "/images/metric/categories/cat-2.jpg",
      "/images/metric/categories/cat-3.jpg",
      "/images/metric/categories/cat-4.jpg",
      "/images/metric/categories/cat-5.jpg",
    ],
  },
  caseStudies: {
    title: "See how better visuals drive real Amazon results.",
    titleAccent: "Amazon results.",
    subtitle:
      "Explore how strategic Amazon listing images and A+ Content helped brands attract more attention, communicate value more clearly, and improve conversion.",
    moreLabel: "More Projects",
    viewLabel: "View Case-Study",
    items: [
      {
        slug: "matolux",
        tags: ["Listing", "Agriculture", "Premium A+"],
        quote: "Your ideas really do make all the difference",
        author: "Markus Pfister",
        role: "MATOLUX, Mitgründer & Geschäftsführer",
        image: "/images/metric/cases/case-1.jpg",
      },
      {
        slug: "craftus",
        tags: ["Listing", "Agriculture", "Premium A+"],
        quote: "All performance figures have risen significantly",
        author: "Louis Bierbaum",
        role: "CRAFTUS, Mitgründer & Geschäftsführer",
        image: "/images/metric/cases/case-2.jpg",
      },
      {
        slug: "tobias",
        tags: ["Listing", "Home", "Premium A+"],
        quote: "The conversion rate has increased by one and a half times",
        author: "Tobias Fraikin",
        role: "Brand founder",
        image: "/images/metric/cases/case-3.jpg",
      },
    ],
  },
  services: {
    id: "services",
    title: "Everything your Amazon brand needs to convert [in one place]",
    subtitle:
      "Amazon listing images, A+ Content, Brand Stores, and advertising creatives built as one consistent visual system.",
    cta: "Book a Free Concept Call",
    items: [
      {
        n: "1",
        title: "Product images",
        image: "/images/metric/services/svc-1.jpg",
      },
      {
        n: "2",
        title: "A+ Content",
        image: "/images/metric/services/svc-2.jpg",
      },
      {
        n: "3",
        title: "Ad-Banner",
        image: "/images/metric/services/svc-3.jpg",
      },
      {
        n: "4",
        title: "BrandStore",
        image: "/images/metric/services/svc-4.jpg",
      },
    ],
  },
  workflow: {
    id: "workflow",
    title: "That’s how Metric are made",
    subtitle: "Unique visual worlds — hand-drawn.",
    cta: "Let’s Talk",
    note: "We’d be happy to present more projects in a personal call.",
    cards: [
      {
        title: "Launching has never been this easy!",
        image: "/images/metric/workflow/wf-1.png",
      },
      {
        title: "A consistent bestseller and Amazon’s Choice",
        image: "/images/metric/workflow/wf-2.jpg",
      },
      {
        title: "Launch your first product with confidence",
        image: "/images/metric/workflow/wf-3.png",
      },
    ],
  },
  faq: {
    id: "faq",
    title: "FAQ",
    subtitle:
      "Here you will find the most important answers about our Amazon product images, videos, and services.",
  },
  footer: {
    cities: ["London", "New York", "Austin", "Berlin"],
    links: [
      { label: "Privacy Policy", href: "#" },
      { label: "Newsletter", href: "#" },
      { label: "Careers", href: "#" },
    ],
    social: [
      { label: "Instagram", key: "instagram" as const },
      { label: "LinkedIn", key: "linkedin" as const },
      { label: "X", key: "x" as const },
      { label: "Facebook", key: "facebook" as const },
    ],
    startCta: "Start Your Project",
  },
} as const;
