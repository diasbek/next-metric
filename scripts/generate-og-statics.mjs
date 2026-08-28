/**
 * Pre-render static OG PNGs into public/images/og for Telegram/social crawlers.
 * Hostinger often fails @vercel/og (WASM); static files are always reliable.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "public", "images", "og");

const PAGES = {
  en: {
    home: {
      title: "Amazon listing images & A+ Content",
      description:
        "On Amazon, customers buy with their eyes first. Strategic listing images and A+ Content that turn attention into sales.",
      eyebrow: "Amazon design",
    },
    works: {
      title: "Projects",
      description: "Amazon listing and A+ Content case studies by METRIC.",
      eyebrow: "Projects",
    },
    agency: {
      title: "About METRIC",
      description:
        "Amazon design partner for listing images, A+ Content, and Brand Stores.",
      eyebrow: "About",
    },
    services: {
      title: "Services",
      description: "Product images, A+ Content, Ad Banner, and Brand Store design.",
      eyebrow: "Services",
    },
    contacts: {
      title: "Contact",
      description: "Start your Amazon design project with METRIC.",
      eyebrow: "Contact",
    },
  },
  de: {
    home: {
      title: "Amazon Listing-Bilder & A+ Content",
      description:
        "Auf Amazon kaufen Kunden zuerst mit den Augen. Strategische Listing-Bilder und A+ Content, die Aufmerksamkeit in Verkäufe verwandeln.",
      eyebrow: "Amazon Design",
    },
    works: {
      title: "Projekte",
      description: "Amazon Listing- und A+ Content Case Studies von METRIC.",
      eyebrow: "Projekte",
    },
    agency: {
      title: "Über METRIC",
      description:
        "Amazon-Designpartner für Listing-Bilder, A+ Content und Brand Stores.",
      eyebrow: "Über uns",
    },
    services: {
      title: "Leistungen",
      description: "Produktbilder, A+ Content, Ad Banner und Brand Store Design.",
      eyebrow: "Leistungen",
    },
    contacts: {
      title: "Kontakt",
      description: "Starten Sie Ihr Amazon-Designprojekt mit METRIC.",
      eyebrow: "Kontakt",
    },
  },
};

async function main() {
  const { renderOgPngBuffer } = await import(
    pathToFileURL(path.join(root, "src/utils/og/render.ts")).href
  );

  fs.mkdirSync(outDir, { recursive: true });

  for (const [locale, pages] of Object.entries(PAGES)) {
    for (const [page, copy] of Object.entries(pages)) {
      const buf = await renderOgPngBuffer({
        title: copy.title,
        description: copy.description,
        eyebrow: copy.eyebrow,
        siteUrl: "metric.graphics",
      });
      const file = path.join(outDir, `${locale}-${page}.png`);
      fs.writeFileSync(file, buf);
      console.log("wrote", path.relative(root, file), buf.length);
    }
  }

  // Default alias used by legacy metadata
  fs.copyFileSync(
    path.join(outDir, "en-home.png"),
    path.join(outDir, "default.png"),
  );
  console.log("wrote public/images/og/default.png");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
