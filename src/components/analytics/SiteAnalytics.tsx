import { ConsentGatedAnalytics } from "./ConsentGatedAnalytics";
import { getResolvedAnalytics } from "@/lib/cms/settings";

/** Resolves analytics IDs on the server; actual script mounting is gated
 * client-side behind cookie consent (see ConsentGatedAnalytics). */
export async function SiteAnalytics() {
  const analytics = await getResolvedAnalytics();
  return <ConsentGatedAnalytics analytics={analytics} />;
}
