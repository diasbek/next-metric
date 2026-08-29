import { describe, expect, it } from "vitest";
import { getMetricHome } from "@/data/metric-home";
import { deepFallbackEmpty } from "@/lib/cms/locale-fallback";
import {
  caseStudyItemsFromPayload,
  mergeMetricHome,
} from "@/lib/cms/metric-home-merge";

describe("mergeMetricHome case studies", () => {
  it("lets an explicit empty items array clear static defaults", () => {
    const base = getMetricHome("en");
    expect(base.caseStudies.items.length).toBeGreaterThan(0);

    const merged = mergeMetricHome(base, {
      caseStudies: {
        ...base.caseStudies,
        items: [],
      },
    });

    expect(merged.caseStudies.items).toEqual([]);
    expect(merged.caseStudies.title).toBe(base.caseStudies.title);
  });

  it("keeps CMS empty items after DE deepFallbackEmpty against EN defaults", () => {
    const deBase = getMetricHome("de");
    const enBase = getMetricHome("en");
    const dePayload = {
      caseStudies: { ...deBase.caseStudies, items: [] },
    };
    const enMerged = mergeMetricHome(enBase, {
      caseStudies: { ...enBase.caseStudies, items: [] },
    });
    let merged = mergeMetricHome(deBase, dePayload);
    merged = deepFallbackEmpty(merged, enMerged);

    const cmsItems = caseStudyItemsFromPayload(dePayload);
    expect(cmsItems).toEqual([]);
    if (cmsItems) {
      merged = {
        ...merged,
        caseStudies: { ...merged.caseStudies, items: cmsItems },
      };
    }

    expect(merged.caseStudies.items).toEqual([]);
  });
});
