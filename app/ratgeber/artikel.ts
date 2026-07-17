// Zentrale Liste aller Ratgeber-Artikel.
// Neuen Artikel schreiben? Hier eintragen — Übersichtsseite UND Sitemap ziehen
// sich die Liste von hier, dann muss nichts doppelt gepflegt werden.
export const ARTIKEL = [
  {
    slug: "unterweisung-vorlage",
    titel: "Unterweisung Vorlage: kostenloses Muster + Anleitung",
    text: "Fertige Muster-Vorlage zum Kopieren, plus Anleitung: Wie oft musst du unterweisen und was gehört rechtlich in den Nachweis?",
    dauer: "5 Min.",
  },
  {
    slug: "unterweisung-fremdsprachige-mitarbeiter",
    titel: "Unterweisung für fremdsprachige Mitarbeiter",
    text: "Muss übersetzt werden? Was BetrSichV und GefStoffV zur verständlichen Sprache sagen – und vier Wege, die in der Praxis funktionieren.",
    dauer: "6 Min.",
  },
  {
    slug: "digitale-unterweisung-rechtssicher",
    titel: "Digitale Unterweisung: Ist das rechtssicher?",
    text: "Papier ist nirgends vorgeschrieben. Warum du keine teure E-Signatur brauchst und was einen digitalen Nachweis wirklich belastbar macht.",
    dauer: "6 Min.",
  },
] as const;
