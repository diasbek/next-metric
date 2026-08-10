import { getLocalizedNotFoundMetadata } from "@/i18n/metadata";
import { NotFoundView } from "@/views/NotFoundView";

export const metadata = getLocalizedNotFoundMetadata("en");

export default function NotFound() {
  return <NotFoundView />;
}
