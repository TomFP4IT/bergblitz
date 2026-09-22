import type { APIRoute } from "astro";
import { PAGES } from "~/lib/page-registry";
import { getLocalizedPath, type Locale } from "~/i18n";

type UrlBlock = {
  deUrl: string;
  enUrl: string;
};

function buildUrl(site: URL, lang: Locale, slug: string): string {
  const base = site.href.replace(/\/$/, "");
  return `${base}${getLocalizedPath(slug, lang)}`;
}

function renderUrlBlock({ deUrl, enUrl }: UrlBlock, loc: string): string {
  return `  <url>
    <loc>${loc}</loc>
    <xhtml:link rel="alternate" hreflang="de" href="${deUrl}" />
    <xhtml:link rel="alternate" hreflang="en" href="${enUrl}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${deUrl}" />
  </url>`;
}

function collectStaticBlocks(site: URL): string[] {
  const blocks: string[] = [];

  // Home pages
  const base = site.href.replace(/\/$/, "");
  const deHome = `${base}${getLocalizedPath("", "de")}`;
  const enHome = `${base}${getLocalizedPath("", "en")}`;
  const homePair: UrlBlock = { deUrl: deHome, enUrl: enHome };
  blocks.push(renderUrlBlock(homePair, deHome));
  blocks.push(renderUrlBlock(homePair, enHome));

  // Static pages from registry (exclude noindex pages)
  for (const page of PAGES) {
    if ("noindex" in page && page.noindex) continue;
    const deUrl = buildUrl(site, "de", page.slug.de);
    const enUrl = buildUrl(site, "en", page.slug.en);
    const urlPair: UrlBlock = { deUrl, enUrl };
    blocks.push(renderUrlBlock(urlPair, deUrl));
    blocks.push(renderUrlBlock(urlPair, enUrl));
  }

  return blocks;
}

export const GET: APIRoute = ({ site }) => {
  const siteUrl = site ?? new URL("https://arberblitz.de");

  const urlBlocks = collectStaticBlocks(siteUrl);

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xhtml="http://www.w3.org/1999/xhtml"
>
${urlBlocks.join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
};
