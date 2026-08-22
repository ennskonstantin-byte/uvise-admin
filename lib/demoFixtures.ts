// [v2c, 18.08.26] Feste Beispieldaten für den zugangsdatenfreien
// Vorschau-Export des authentifizierten Web-Bereichs (preview-web).
//
// Zweck: der unabhängige Prüfer soll die eingeloggten Dashboard-Screens
// visuell prüfen können, OHNE dass irgendjemand ein Passwort eintippt und
// OHNE dass ein Login-Vorgang automatisiert wird. Deshalb hier reine
// Konstanten statt eines echten Datenbank-Zugriffs — im Vorschau-Modus
// (NEXT_PUBLIC_DEMO_MODE=true) findet KEIN Supabase-Aufruf und KEINE
// Authentifizierung statt.
//
// Inhaltlich bewusst dieselbe Beispielfirma wie die bereits bestehenden
// RN-App-Vorschauen (preview-chef/preview-ma), damit Web und App im Review
// vergleichbar sind. Alle Personen sind frei erfunden.
import type {
  Employee,
  Training,
  Bundle,
  Category,
  Qualification,
  Question,
  EmployeeTraining,
} from "@/lib/types";

function tage(plus: number): string {
  const d = new Date();
  d.setDate(d.getDate() + plus);
  return d.toISOString().slice(0, 10);
}

function de(iso: string): string {
  const [j, m, t] = iso.split("-");
  return `${Number(t)}.${Number(m)}.${j}`;
}

export const DEMO_COMPANY = {
  id: "demo-company",
  name: "uVise Demo GmbH",
  address: "Musterstraße 1, 12345 Musterstadt",
  strasse: "Musterstraße 1",
  plz: "12345",
  ort: "Musterstadt",
  chefName: "Nina Müller",
  logoUrl: null,
  plan: "profi",
  billing: "monatlich",
  subscriptionStatus: "active",
  createdAt: tage(-400),
  contractStartedAt: tage(-400),
  cancelAt: null,
  aufbewahrungsfristMonate: 36,
};

export const DEMO_CATEGORIES: Category[] = [
  { id: "cat-buero", name: "Büro", icon: "🗂️" },
  { id: "cat-lager", name: "Lager", icon: "📦" },
  { id: "cat-kueche", name: "Küche", icon: "🍳" },
];

export const DEMO_EMPLOYEES: Employee[] = [
  {
    id: "emp-nina",
    vorname: "Nina",
    nachname: "Müller",
    personalnummer: "P-100",
    email: null,
    telefon: null,
    geburtsdatum: null,
    fotoUrl: null,
    kategorie: "Büro",
    archiviert: false,
    minderjaehrig: false,
    ampel: "gruen",
    offenePunkte: 0,
    qualifikationsIcons: [],
    istBeauftragter: true,
    inviteToken: null,
    registriert: true,
    version: 1,
  },
  {
    id: "emp-sophie",
    vorname: "Sophie",
    nachname: "Wagner",
    personalnummer: "P-101",
    email: null,
    telefon: null,
    geburtsdatum: null,
    fotoUrl: null,
    kategorie: "Büro",
    archiviert: false,
    minderjaehrig: false,
    ampel: "rot",
    offenePunkte: 2,
    qualifikationsIcons: ["✚"],
    istBeauftragter: false,
    inviteToken: null,
    registriert: true,
    version: 1,
  },
  {
    id: "emp-tom",
    vorname: "Tom",
    nachname: "Krüger",
    personalnummer: "P-102",
    email: null,
    telefon: null,
    geburtsdatum: null,
    fotoUrl: null,
    kategorie: "Lager",
    archiviert: false,
    minderjaehrig: false,
    ampel: "rot",
    offenePunkte: 3,
    qualifikationsIcons: ["🚜"],
    istBeauftragter: false,
    inviteToken: null,
    registriert: false,
    version: 1,
  },
  {
    id: "emp-aylin",
    vorname: "Aylin",
    nachname: "Sarı",
    personalnummer: "P-103",
    email: null,
    telefon: null,
    geburtsdatum: null,
    fotoUrl: null,
    kategorie: "Küche",
    archiviert: false,
    minderjaehrig: false,
    ampel: "rot",
    offenePunkte: 3,
    qualifikationsIcons: [],
    istBeauftragter: false,
    inviteToken: null,
    registriert: false,
    version: 1,
  },
];

export const DEMO_TRAININGS: Training[] = [
  {
    id: "trn-brand",
    name: "Brandschutzunterweisung",
    typ: "online",
    icon: "🔥",
    inhalt:
      "Verhalten im Brandfall: Ruhe bewahren, Fluchtwege nutzen, Sammelpunkt aufsuchen. Feuerlöscher befinden sich an jedem Ausgang.",
    pdfPath: null,
    erstelltAm: tage(-120),
    ablaufdatum: de(tage(300)),
    status: "aktuell",
    version: 1,
  },
  {
    id: "trn-ersthilfe",
    name: "Erste Hilfe am Arbeitsplatz",
    typ: "online",
    icon: "✚",
    inhalt:
      "Grundlagen der Ersten Hilfe: Absichern der Unfallstelle, Notruf 112, stabile Seitenlage, Verbandskasten-Standorte im Betrieb.",
    pdfPath: null,
    erstelltAm: tage(-200),
    ablaufdatum: de(tage(-6)),
    status: "abgelaufen",
    version: 1,
  },
  {
    id: "trn-elektro",
    name: "Elektrische Arbeitsmittel",
    typ: "online",
    icon: "⚡",
    inhalt:
      "Vor jeder Nutzung Sichtprüfung auf Beschädigungen. Defekte Geräte sofort aus dem Verkehr ziehen und melden. Prüffristen nach DGUV V3 beachten.",
    pdfPath: null,
    erstelltAm: tage(-90),
    ablaufdatum: de(tage(25)),
    status: "laeuft_ab",
    version: 1,
  },
];

export const DEMO_BUNDLES: Bundle[] = [
  {
    id: "bdl-produktion",
    name: "Produktion",
    icon: "🏭",
    trainingIds: ["trn-brand", "trn-elektro"],
  },
];

export const DEMO_QUALIFICATIONS: Qualification[] = [
  {
    id: "qua-ersthelfer",
    employeeId: "emp-sophie",
    name: "Ersthelfer",
    icon: "✚",
    ablaufdatum: de(tage(20)),
    ablaufdatumIso: tage(20),
    status: "laeuft_ab",
    terminVereinbartAm: null,
    naechsteErinnerungAm: null,
  },
  {
    id: "qua-stapler",
    employeeId: "emp-tom",
    name: "Staplerschein",
    icon: "🚜",
    ablaufdatum: de(tage(400)),
    ablaufdatumIso: tage(400),
    status: "gueltig",
    terminVereinbartAm: null,
    naechsteErinnerungAm: null,
  },
];

export const DEMO_QUESTIONS: Question[] = [
  {
    id: "qst-1",
    employeeId: "emp-sophie",
    trainingId: "trn-elektro",
    frage: "Gilt die Sichtprüfung auch für private Geräte am Arbeitsplatz?",
    antwort: null,
    status: "offen",
    gestelltAm: de(tage(-2)),
  },
  {
    id: "qst-2",
    employeeId: "emp-tom",
    trainingId: "trn-brand",
    frage: "Wo genau ist unser Sammelpunkt?",
    antwort: "Auf dem Mitarbeiterparkplatz, rechts neben der Einfahrt.",
    status: "beantwortet",
    gestelltAm: de(tage(-9)),
  },
];

// Zuweisungen: Sophie hat Brandschutz signiert, alles andere offen — dadurch
// zeigt das Dashboard eine echte Rücklaufquote statt 0 % oder 100 %.
export const DEMO_EMPLOYEE_TRAININGS: EmployeeTraining[] = (() => {
  const rows: EmployeeTraining[] = [];
  for (const emp of DEMO_EMPLOYEES.filter((e) => !e.istBeauftragter)) {
    for (const trn of DEMO_TRAININGS) {
      const signiert = emp.id === "emp-sophie" && trn.id === "trn-brand";
      rows.push({
        id: `et-${emp.id}-${trn.id}`,
        employeeId: emp.id,
        trainingId: trn.id,
        status: signiert ? "signiert" : "offen",
        signiertAm: signiert ? de(tage(-14)) : null,
        signaturBildUrl: null,
        geraet: signiert ? "iOS 18.2" : null,
        signaturHash: signiert ? "demo-hash-nur-beispiel" : null,
        signiertAls: signiert ? "Sophie Wagner" : null,
        ablaufdatumIso: null,
      });
    }
  }
  return rows;
})();
