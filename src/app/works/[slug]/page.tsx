import { createWorkCasePage } from "@/i18n/create-pages";

const workCasePage = createWorkCasePage("en");

export const generateStaticParams = workCasePage.generateStaticParams;
export const generateMetadata = workCasePage.generateMetadata;
export default workCasePage.Page;
