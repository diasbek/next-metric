import { getLocalizedNotFoundMetadata } from "@/i18n/metadata";
import { NotFoundView } from "@/views/NotFoundView";

export const metadata = getLocalizedNotFoundMetadata("ru");

export default function NotFound() {
  return <NotFoundView />;
}
