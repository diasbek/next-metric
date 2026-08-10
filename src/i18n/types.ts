import type { FAQItem } from "@/data/faq";
import type { CaseStudy, Project } from "@/data/projects";
import type { ProcessStep } from "@/data/process";
import type { Service } from "@/data/services";
import type { Testimonial } from "@/data/agency";
import type { PageKey } from "./config";

export interface SiteNavItem {
  label: string;
  path: string;
}

export interface SiteContent {
  site: {
    name: string;
    title: string;
    description: string;
    url: string;
    phone: string;
    address: string[];
    nav: SiteNavItem[];
    social: {
      telegram: string;
      instagram: string;
    };
    files: {
      presentation: string;
      brief: string;
    };
  };
  pageMeta: Record<
    PageKey,
    {
      title: string;
      description: string;
      keywords?: string;
    }
  >;
  ui: {
    openMenu: string;
    closeMenu: string;
    phoneLabel: string;
    addressLabel: string;
    telegramAction: string;
    instagramAction: string;
    discussProject: string;
    send: string;
    sending: string;
    submitted: string;
    attachFile: string;
    removeFile: string;
    fileUploading: string;
    fileAttached: string;
    name: string;
    phone: string;
    describeProject: string;
    task: string;
    solution: string;
    nextProjects: string;
    notFoundTitle: string;
    notFoundText: string;
    backHome: string;
    logoCompareBefore: string;
    logoCompareAfter: string;
    allProjects: string;
    filterSphere: string;
    filterDirection: string;
    filterAll: string;
    downloadPresentation: string;
    downloadBrief: string;
    downloadHint: string;
    presentationHint: string;
    briefHint: string;
    contactSubtitle: string;
    contactPageSubtitle: string;
    respondWithinHour: string;
    contactUs: string;
    oneStep: string;
    strongBrand: string;
    foundedIn: string;
    factsTitle: string;
    clientsTitle: string;
    faqTitle: string;
    whatWeDo: string;
    howWeWork: string;
    whyUsTitle: string;
    otherWorks: string;
    beforeAfterLabel: string;
    agencyTagline: string;
    teamTitle: string;
    orderService: string;
    allServices: string;
    download: string;
    mapAlt: string;
    navAria: string;
    langAria: string;
    prevTestimonial: string;
    nextTestimonial: string;
    breadcrumbHome: string;
    breadcrumbAgency: string;
    breadcrumbWorks: string;
    breadcrumbServices: string;
    breadcrumbContacts: string;
    yearSuffix: string;
  };
  hero: {
    titleLines: [string, string];
    servicesLines: [string, string, string];
    tagline: string;
  };
  projects: Project[];
  services: Service[];
  agency: {
    about: {
      title: string;
      titleLines: [string, string];
      paragraphs: string[];
    };
    foundedYear: string;
    stats: { value: string; label: string }[];
    director: { name: string; role: string; image: string; imageObjectPosition?: string };
    team: { name: string; role: string; image: string; imageObjectPosition?: string }[];
    testimonials: Testimonial[];
  };
  faq: FAQItem[];
  benefits: string[];
  processSteps: ProcessStep[];
  sphereFilters: readonly string[];
  directionFilters: readonly string[];
  sections: {
    servicesHome: { title: string; cta: string }[];
    processTitle: [string, string];
    whyUs: string;
    whyUsTitleLines: [string, string];
  };
}

export type { CaseStudy, Project };
