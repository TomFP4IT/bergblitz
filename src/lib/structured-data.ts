/**
 * Reusable JSON-LD payloads for site-wide structured data.
 */

import type { Locale } from "~/i18n";

export type { Locale };

/** Brand identity resolved at render time, threaded into every JSON-LD builder. */
export interface SiteIdentity {
  /** Organization / site name — from the `site.name` i18n string. */
  name: string;
  /** Absolute site origin, no trailing slash — from `Astro.site`. */
  url: string;
  /** Absolute logo URL — the site favicon, which `/brand` owns. */
  logoUrl: string;
}

/**
 * Derive the brand identity from Astro's configured `site` and the localized
 * name. Keeps brand strings out of this module entirely: an onboarded site
 * changes the `site.name` i18n string and `astro.config.mjs` `site` — never
 * this file.
 */
export function getSiteIdentity(
  site: URL | undefined,
  name: string,
): SiteIdentity {
  const url = (site?.href ?? "https://example.com").replace(/\/+$/, "");
  return { name, url, logoUrl: `${url}/favicon.svg` };
}

/** Organization JSON-LD node. */
export function buildOrganizationLd(id: SiteIdentity): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: id.name,
    url: id.url,
    logo: { "@type": "ImageObject", url: id.logoUrl },
  };
}

/** Breadcrumb list JSON-LD node. */
export function buildBreadcrumbLd(
  items: { name: string; url: string }[],
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
