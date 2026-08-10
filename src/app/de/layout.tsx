import { LocaleRoot } from "@/i18n/LocaleRoot";

export default function DeLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <LocaleRoot locale="de">
      {children}
      {modal}
    </LocaleRoot>
  );
}
