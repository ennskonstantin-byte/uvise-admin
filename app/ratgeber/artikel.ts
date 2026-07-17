// Zentrale Liste aller Ratgeber-Artikel.
// Neuen Artikel schreiben? Hier eintragen — Übersichtsseite UND Sitemap ziehen
// sich die Liste von hier, dann muss nichts doppelt gepflegt werden.
// Reihenfolge = Reihenfolge auf der Übersichtsseite (Wichtigstes zuerst).
export const ARTIKEL = [
  {
    slug: "unterweisung-fristen",
    titel: "Wie oft muss unterwiesen werden?",
    text: "Jährlich, halbjährlich oder sofort? Alle Fristen mit Paragrafen – inklusive der Anlässe, die man im Alltag übersieht.",
    dauer: "6 Min.",
  },
  {
    slug: "unterweisung-vorlage",
    titel: "Unterweisung Vorlage: kostenloses Muster + Anleitung",
    text: "Fertige Muster-Vorlage zum Kopieren, plus Anleitung: Wie oft musst du unterweisen und was gehört rechtlich in den Nachweis?",
    dauer: "5 Min.",
  },
  {
    slug: "erstunterweisung-neue-mitarbeiter",
    titel: "Erstunterweisung neuer Mitarbeiter: Ablauf + Checkliste",
    text: "Vor der ersten Tätigkeit, nicht nächste Woche. Checkliste zum Abhaken und die drei Fehler, die fast jeder macht.",
    dauer: "6 Min.",
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
  {
    slug: "unterweisung-vergessen",
    titel: "Unterweisung vergessen – was jetzt?",
    text: "Was du sofort tun solltest, warum Rückdatieren die schlechteste aller Ideen ist und welche Bußgelder wirklich drohen.",
    dauer: "5 Min.",
  },
  {
    slug: "gefaehrdungsbeurteilung-unterweisung",
    titel: "Gefährdungsbeurteilung und Unterweisung",
    text: "Die eine sagt dir, worüber du bei der anderen reden musst. Wer sie braucht (jeder), wie sie abläuft und was passiert, wenn sie fehlt.",
    dauer: "6 Min.",
  },
] as const;
