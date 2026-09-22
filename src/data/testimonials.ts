import type { Locale } from "~/i18n";

interface Testimonial {
  quote: string;
  author: string;
  company: string;
}

const testimonials: Record<Locale, Testimonial[]> = {
  de: [],
  en: [],
};

export function getTestimonials(locale: Locale): Testimonial[] {
  return testimonials[locale];
}
