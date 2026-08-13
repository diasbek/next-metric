import { LocaleRoot } from "@/i18n/LocaleRoot";

export default function DeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <LocaleRoot locale="de">{children}</LocaleRoot>;
}
