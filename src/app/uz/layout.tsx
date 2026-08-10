import { LocaleRoot } from "@/i18n/LocaleRoot";

export default function UzLayout({ children }: { children: React.ReactNode }) {
  return <LocaleRoot locale="uz">{children}</LocaleRoot>;
}
