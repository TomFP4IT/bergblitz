import type { Locale } from "~/i18n";

export type { Locale };

export type PageKey = "about" | "contact" | "privacy" | "imprint";

export type CollectionName = "pages" | "team";

export interface PageEntry {
  key: PageKey;
  slug: { de: string; en: string };
  component: () => Promise<{ default: unknown }>;
  noindex?: boolean;
}

// ---------------------------------------------------------------------------
// Route match discriminated union
// ---------------------------------------------------------------------------

export type StaticPageMatch = { kind: "static-page"; entry: PageEntry };

export type RouteMatch = StaticPageMatch;

// ---------------------------------------------------------------------------
// Static pages
// ---------------------------------------------------------------------------

export const PAGES = [
  {
    key: "about" as const,
    slug: { de: "ueber-uns", en: "about" },
    component: () => import("~/components/pages/about.astro"),
  },
  {
    key: "contact" as const,
    slug: { de: "kontakt", en: "contact" },
    component: () => import("~/components/pages/contact.astro"),
  },
  {
    key: "privacy" as const,
    slug: { de: "datenschutz", en: "privacy" },
    component: () => import("~/components/pages/privacy.astro"),
  },
  {
    key: "imprint" as const,
    slug: { de: "impressum", en: "imprint" },
    component: () => import("~/components/pages/imprint.astro"),
  },
] satisfies PageEntry[];

// ---------------------------------------------------------------------------
// Helpers for static pages
// ---------------------------------------------------------------------------

export function findPageByKey(key: PageKey): PageEntry | undefined {
  return PAGES.find((p) => p.key === key);
}

export function findPageBySlug(
  lang: Locale,
  slug: string,
): PageEntry | undefined {
  return PAGES.find((p) => p.slug[lang] === slug);
}

// ---------------------------------------------------------------------------
// getAllPaths — static only
// ---------------------------------------------------------------------------

/** Route param for the apex catch-all: DE without prefix, EN under en/. */
function toPathParam(lang: Locale, slug: string): string {
  return lang === "de" ? slug : `en/${slug}`;
}

type StaticPagePath = {
  params: { path: string };
  props: { kind: "static-page"; lang: Locale; slug: string };
};

export function getAllPaths(): StaticPagePath[] {
  const staticPaths: StaticPagePath[] = [];
  for (const entry of PAGES) {
    staticPaths.push({
      params: { path: toPathParam("de", entry.slug.de) },
      props: { kind: "static-page", lang: "de", slug: entry.slug.de },
    });
    staticPaths.push({
      params: { path: toPathParam("en", entry.slug.en) },
      props: { kind: "static-page", lang: "en", slug: entry.slug.en },
    });
  }
  return staticPaths;
}

// ---------------------------------------------------------------------------
// Alternate locale slug helpers
// ---------------------------------------------------------------------------

export function getAlternateLocaleSlug(
  currentLang: Locale,
  currentSlug: string,
): { lang: Locale; slug: string } | undefined {
  const entry = findPageBySlug(currentLang, currentSlug);
  if (!entry) return undefined;
  const otherLang: Locale = currentLang === "de" ? "en" : "de";
  return { lang: otherLang, slug: entry.slug[otherLang] };
}

/**
 * Finds the alternate locale slug for a pages-collection entry by translationKey.
 * Used by page components that drive their alternate-locale link from the
 * pages content collection rather than the static page registry.
 * Returns the URL slug for the alternate locale page (e.g. "contact" when DE→EN).
 */
export async function getAlternateCollectionSlug(
  currentLang: Locale,
  _collection: "pages",
  translationKey: string,
): Promise<string | undefined> {
  const { getCollection } = await import("astro:content");
  const otherLang: Locale = currentLang === "de" ? "en" : "de";
  const entries = await getCollection("pages");
  const paired = entries.find(
    (e) =>
      (e.data as { translationKey: string }).translationKey ===
        translationKey && e.id.startsWith(`${otherLang}/`),
  );
  if (!paired) return undefined;
  // The entry ID is like "en/contact" — the slug after the locale prefix is the URL slug.
  return paired.id.slice(paired.id.indexOf("/") + 1);
}
