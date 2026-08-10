import { LocaleRoot } from "@/i18n/LocaleRoot";

export default function EnLayout({ children }: { children: React.ReactNode }) {
  return <LocaleRoot locale="en">{children}</LocaleRoot>;
}
