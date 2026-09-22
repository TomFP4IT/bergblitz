import type { Locale } from "~/i18n";

interface FAQ {
  question: string;
  answer: string;
}

const faqs: Record<Locale, FAQ[]> = {
  de: [
    {
      question: "Wann und wo findet der Arberblitz 2026 statt?",
      answer:
        "Der Arberblitz 2026 findet am 17. Oktober 2026 statt. Der Start ist an der Clubhütte des SC Bodenmais in Bodenmais (750 m), das Ziel ist die Chamer Hütte auf dem Großen Arber (1.300 m).",
    },
    {
      question: "Welche Kategorien gibt es?",
      answer:
        "Es gibt drei Kategorien: Mountainbike (ohne E-Bike), Gravelbike (ohne E-Bike) und Trail Running. Jede Kategorie hat eine eigene Zeitwertung.",
    },
    {
      question: "Sind E-Bikes erlaubt?",
      answer:
        "Nein. Sowohl in der Mountainbike- als auch in der Gravelbike-Kategorie sind E-Bikes nicht zugelassen. Das Rennen ist als klassisches Uphill-Zeitfahren aus eigener Muskelkraft konzipiert.",
    },
    {
      question: "Wie lang ist die Strecke und wie viele Höhenmeter sind es?",
      answer:
        "Die Strecke ist ca. 8 km lang und überwindet 550 Höhenmeter — vom Start in Bodenmais auf 750 m bis zur Chamer Hütte auf 1.300 m.",
    },
    {
      question: "Wie kann ich mich anmelden?",
      answer:
        "Die Anmeldung erfolgt direkt beim SC Bodenmais. Kontaktieren Sie uns per E-Mail an service@sc-bodenmais.de oder telefonisch unter +49 (0)9924/770-0717.",
    },
    {
      question: "Ist das Rennen auch für Freizeitsportler geeignet?",
      answer:
        "Ja! Beim Arberblitz sind alle willkommen — vom ambitionierten Rennfahrer bis zum Freizeitbiker. Wer die Herausforderung sucht und Spaß am Bergsport hat, ist genau richtig.",
    },
  ],
  en: [
    {
      question: "When and where does Arberblitz 2026 take place?",
      answer:
        "Arberblitz 2026 takes place on 17 October 2026. The start is at the SC Bodenmais clubhouse in Bodenmais (750 m), and the finish is at Chamer Hütte on the Großer Arber (1,300 m).",
    },
    {
      question: "What categories are there?",
      answer:
        "There are three categories: Mountain Bike (no e-bikes), Gravel Bike (no e-bikes) and Trail Running. Each category has its own timed classification.",
    },
    {
      question: "Are e-bikes allowed?",
      answer:
        "No. E-bikes are not permitted in either the mountain bike or gravel bike categories. The race is designed as a classic uphill time trial under your own muscle power.",
    },
    {
      question: "How long is the route and how much elevation gain is there?",
      answer:
        "The route is approximately 8 km long with 550 m of elevation gain — from the start in Bodenmais at 750 m up to Chamer Hütte at 1,300 m.",
    },
    {
      question: "How do I register?",
      answer:
        "Registration is handled directly by SC Bodenmais. Contact us by email at service@sc-bodenmais.de or by phone at +49 (0)9924/770-0717.",
    },
    {
      question: "Is the race suitable for recreational athletes?",
      answer:
        "Yes! Everyone is welcome at Arberblitz — from the ambitious racer to the leisure cyclist. If you enjoy the challenge and love mountain sport, this event is for you.",
    },
  ],
};

export function getFAQs(locale: Locale): FAQ[] {
  return faqs[locale];
}
