export const COMPANY = {
  name: "Musterfirma GmbH",
  address: "Musterstraße 1, 12345 Musterstadt",
  adminName: "Erika Musterchefin",
};

export type Employee = {
  id: string;
  vorname: string;
  nachname: string;
  personalnummer: string;
  email: string | null;
  telefon: string | null;
  geburtsdatum: string | null;
  fotoUrl: string | null;
  kategorie: string;
  archiviert: boolean;
  minderjaehrig: boolean;
  ampel: "rot" | "gruen";
  offenePunkte: number;
  qualifikationsIcons: string[];
  istBeauftragter: boolean;
  inviteToken: string | null;
  registriert: boolean;
};

export type Category = {
  id: string;
  name: string;
  icon: string;
};

// 20 vordefinierte Icon-Vorschläge + 4 generische, laut Spezifikation Abschnitt 4.3
export const CATEGORY_ICON_OPTIONS: { name: string; icon: string }[] = [
  { name: "Lager/Logistik", icon: "📦" },
  { name: "Fahrer/Transport", icon: "🚚" },
  { name: "Küche/Gastro", icon: "🍳" },
  { name: "Reinigung", icon: "🧹" },
  { name: "Sicherheit", icon: "🛡️" },
  { name: "Werkstatt/Technik", icon: "🔧" },
  { name: "Bau/Montage", icon: "🏗️" },
  { name: "Verkauf/Handel", icon: "🛒" },
  { name: "Labor/QS", icon: "🧪" },
  { name: "Staplerfahrer", icon: "🚜" },
  { name: "Meister", icon: "🏅" },
  { name: "Vorarbeiter", icon: "⭐" },
  { name: "IT/Verwaltung", icon: "🖥️" },
  { name: "Pflege/Gesundheit", icon: "🩺" },
  { name: "Ausbildung/Azubi", icon: "🎒" },
  { name: "Empfang/Service", icon: "🔔" },
  { name: "Sonstiges 1", icon: "1️⃣" },
  { name: "Sonstiges 2", icon: "2️⃣" },
  { name: "Sonstiges 3", icon: "3️⃣" },
  { name: "Sonstiges 4", icon: "4️⃣" },
];

export const EMPLOYEES: Employee[] = [
  {
    id: "1",
    vorname: "Max",
    nachname: "Mustermann",
    personalnummer: "P-001",
    email: null,
    telefon: null,
    fotoUrl: null,
    geburtsdatum: null,
    archiviert: false,
    minderjaehrig: false,
    kategorie: "Lager",
    ampel: "rot",
    offenePunkte: 2,
    qualifikationsIcons: ["✚"],
    istBeauftragter: false,
    inviteToken: null,
    registriert: true,
  },
  {
    id: "2",
    vorname: "Anna",
    nachname: "Beispiel",
    personalnummer: "P-002",
    email: null,
    telefon: null,
    fotoUrl: null,
    geburtsdatum: null,
    archiviert: false,
    minderjaehrig: false,
    kategorie: "Büro",
    ampel: "gruen",
    offenePunkte: 0,
    qualifikationsIcons: ["🛡️"],
    istBeauftragter: true,
    inviteToken: null,
    registriert: true,
  },
  {
    id: "3",
    vorname: "Jonas",
    nachname: "Weber",
    personalnummer: "P-003",
    email: null,
    telefon: null,
    fotoUrl: null,
    geburtsdatum: null,
    archiviert: false,
    minderjaehrig: false,
    kategorie: "Produktion",
    ampel: "gruen",
    offenePunkte: 0,
    qualifikationsIcons: ["🔥"],
    istBeauftragter: false,
    inviteToken: null,
    registriert: true,
  },
];

export type Training = {
  id: string;
  name: string;
  typ: "hochgeladen" | "online";
  icon: string;
  inhalt: string | null;
  erstelltAm: string;
  ablaufdatum: string;
  status: "aktuell" | "laeuft_ab";
};

// 30 gängige Icon-Vorschläge für Unterweisungen/Schulungen
export const TRAINING_ICON_OPTIONS: { name: string; icon: string }[] = [
  { name: "Brandschutz", icon: "🔥" },
  { name: "Erste Hilfe", icon: "✚" },
  { name: "Arbeitsschutz", icon: "🦺" },
  { name: "Gefahrstoffe", icon: "☣️" },
  { name: "Elektrik", icon: "⚡" },
  { name: "Absturzsicherung", icon: "🪢" },
  { name: "Datenschutz/DSGVO", icon: "🔒" },
  { name: "IT-Sicherheit", icon: "💻" },
  { name: "Ergonomie", icon: "🪑" },
  { name: "Hygiene", icon: "🧼" },
  { name: "Lebensmittelsicherheit", icon: "🍽️" },
  { name: "Fahrsicherheit", icon: "🚗" },
  { name: "Stapler/Kran", icon: "🚜" },
  { name: "Bauarbeiten", icon: "🏗️" },
  { name: "Werkzeuge/Maschinen", icon: "🛠️" },
  { name: "Schweißen", icon: "🧯" },
  { name: "Chemikalien", icon: "🧪" },
  { name: "Umweltschutz", icon: "♻️" },
  { name: "Lärmschutz", icon: "🎧" },
  { name: "Schutzausrüstung", icon: "🪖" },
  { name: "Erste-Hilfe-Kasten", icon: "🩹" },
  { name: "Notfall/Evakuierung", icon: "🚨" },
  { name: "Rauchverbot", icon: "🚭" },
  { name: "Wassersicherheit", icon: "💧" },
  { name: "Rettungsdienst", icon: "🚑" },
  { name: "Recht/Compliance", icon: "⚖️" },
  { name: "Gesundheit", icon: "🩺" },
  { name: "Psychische Gesundheit", icon: "🧠" },
  { name: "Checkliste/Allgemein", icon: "📋" },
  { name: "Schlüssel/Zugang", icon: "🔑" },
];

export const TRAININGS: Training[] = [
  {
    id: "t1",
    name: "Brandschutzunterweisung",
    typ: "online",
    icon: "✍️",
    inhalt: null,
    erstelltAm: "12.01.2026",
    ablaufdatum: "12.01.2027",
    status: "aktuell",
  },
  {
    id: "t2",
    name: "Gefahrstoffe/GHS",
    typ: "hochgeladen",
    icon: "📄",
    inhalt: null,
    erstelltAm: "03.03.2025",
    ablaufdatum: "03.03.2026",
    status: "laeuft_ab",
  },
  {
    id: "t3",
    name: "Datenschutz/DSGVO",
    typ: "online",
    icon: "✍️",
    inhalt: null,
    erstelltAm: "20.06.2025",
    ablaufdatum: "20.06.2027",
    status: "aktuell",
  },
];

export type EmployeeTraining = {
  id: string;
  employeeId: string;
  trainingId: string;
  status: "offen" | "signiert" | "abgelehnt";
  signiertAm: string | null;
  signaturBildUrl: string | null;
  geraet: string | null;
};

export const EMPLOYEE_TRAININGS: EmployeeTraining[] = [
  { id: "et1", employeeId: "1", trainingId: "t1", status: "offen", signiertAm: null, signaturBildUrl: null, geraet: null },
  { id: "et2", employeeId: "1", trainingId: "t2", status: "offen", signiertAm: null, signaturBildUrl: null, geraet: null },
  {
    id: "et3",
    employeeId: "2",
    trainingId: "t3",
    status: "signiert",
    signiertAm: "04.01.2026",
    signaturBildUrl: null,
    geraet: null,
  },
  {
    id: "et4",
    employeeId: "3",
    trainingId: "t2",
    status: "signiert",
    signiertAm: "10.03.2025",
    signaturBildUrl: null,
    geraet: null,
  },
];

export type Bundle = {
  id: string;
  name: string;
  icon: string;
  trainingIds: string[];
};

export const BUNDLES: Bundle[] = [
  { id: "b1", name: "Produktion", icon: "🏭", trainingIds: ["t2"] },
  { id: "b2", name: "Büro", icon: "🗂️", trainingIds: ["t3"] },
];

export type Qualification = {
  id: string;
  employeeId: string;
  name: string;
  icon: string;
  ablaufdatum: string;
  status: "gueltig" | "laeuft_ab" | "abgelaufen";
};

export const QUALIFICATIONS: Qualification[] = [
  {
    id: "q1",
    employeeId: "1",
    name: "Ersthelfer",
    icon: "✚",
    ablaufdatum: "31.12.2026",
    status: "gueltig",
  },
  {
    id: "q2",
    employeeId: "2",
    name: "Sicherheitsfachkraft/SiFa",
    icon: "🛡️",
    ablaufdatum: "15.08.2026",
    status: "laeuft_ab",
  },
  {
    id: "q3",
    employeeId: "3",
    name: "Brandschutzhelfer",
    icon: "🔥",
    ablaufdatum: "01.02.2026",
    status: "abgelaufen",
  },
];

export type Question = {
  id: string;
  employeeId: string;
  trainingId: string;
  frage: string;
  antwort: string | null;
  status: "offen" | "beantwortet";
  gestelltAm: string;
};

export const QUESTIONS: Question[] = [
  {
    id: "qu1",
    employeeId: "1",
    trainingId: "t1",
    frage: "Muss ich das jährlich wiederholen?",
    antwort: null,
    status: "offen",
    gestelltAm: "05.07.2026",
  },
  {
    id: "qu2",
    employeeId: "3",
    trainingId: "t2",
    frage: "Gilt das auch für Praktikanten?",
    antwort: "Ja, für alle im Lager tätigen Personen.",
    status: "beantwortet",
    gestelltAm: "01.07.2026",
  },
];

export function employeeName(employees: Employee[], id: string) {
  const e = employees.find((e) => e.id === id);
  return e ? `${e.vorname} ${e.nachname}` : "Unbekannt";
}

export function trainingName(trainings: Training[], id: string) {
  return trainings.find((t) => t.id === id)?.name ?? "Unbekannt";
}

export function initials(vorname: string, nachname: string) {
  return `${vorname[0] ?? ""}${nachname[0] ?? ""}`.toUpperCase();
}

// 20 gängige Abteilungs-Symbole + generische Nummern 1–5
export const BUNDLE_ICONS: string[] = [
  "🏭", // Produktion
  "📦", // Lager/Logistik
  "🚚", // Fuhrpark/Fahrer
  "🛒", // Verkauf/Handel
  "🗂️", // Büro/Verwaltung
  "🖥️", // IT
  "🔧", // Werkstatt/Technik
  "🏗️", // Bau/Montage
  "🍳", // Küche/Gastro
  "🧹", // Reinigung
  "🛡️", // Sicherheit
  "🧪", // Labor/QS
  "🩺", // Pflege/Gesundheit
  "👷", // Handwerk
  "🔔", // Empfang/Service
  "📞", // Kundenservice
  "💼", // Vertrieb/Außendienst
  "🧾", // Einkauf/Buchhaltung
  "👥", // Personal/HR
  "🚜", // Technik/Landwirtschaft
  "1️⃣",
  "2️⃣",
  "3️⃣",
  "4️⃣",
  "5️⃣",
];

// 20 gängige Qualifikationen mit bunten, gut erkennbaren Symbolen
export const QUALIFICATION_PRESETS: { name: string; icon: string }[] = [
  { name: "Ersthelfer", icon: "⛑️" },
  { name: "Brandschutzhelfer", icon: "🧯" },
  { name: "Sicherheitsbeauftragter", icon: "🦺" },
  { name: "Sicherheitsfachkraft (SiFa)", icon: "🛡️" },
  { name: "Staplerschein", icon: "🚜" },
  { name: "Kranführer", icon: "🏗️" },
  { name: "LKW-Führerschein (C/CE)", icon: "🚛" },
  { name: "Führerschein (B)", icon: "🚗" },
  { name: "Hubarbeitsbühne", icon: "🪜" },
  { name: "Motorsägenschein", icon: "🪚" },
  { name: "Schweißerprüfung", icon: "🔥" },
  { name: "Elektrofachkraft", icon: "⚡" },
  { name: "Gefahrgut (ADR)", icon: "☣️" },
  { name: "Hygieneschulung (§43)", icon: "🧼" },
  { name: "Ladungssicherung", icon: "📦" },
  { name: "Höhentauglichkeit (G41)", icon: "🧗" },
  { name: "Atemschutz (G26)", icon: "😷" },
  { name: "Betriebssanitäter", icon: "🚑" },
  { name: "Meister/Fachwirt", icon: "🏅" },
  { name: "Ausbilderschein (AEVO)", icon: "🎓" },
];

export function qualIcon(name: string): string {
  return QUALIFICATION_PRESETS.find((q) => q.name === name)?.icon ?? "📋";
}

export const PLANS = [
  {
    name: "Starter",
    preis: "19",
    limit: "bis 5 Mitarbeiter",
    features: ["Unterweisungen & Fristen", "Ampelsystem & Badges", "E-Mail-Erinnerungen"],
  },
  {
    name: "Team",
    preis: "29",
    limit: "bis 15 Mitarbeiter",
    features: ["Alles aus Starter", "Bundle-Vorlagen", "App-Push-Erinnerungen"],
  },
  {
    name: "Betrieb",
    preis: "49",
    limit: "bis 30 Mitarbeiter",
    features: ["Alles aus Team", "Priorisierter Support", "Erweitertes Archiv"],
  },
];

// true wenn unter 18 (dann Unterweisung 2× jährlich)
export function istMinderjaehrig(geburtsdatum: string | null): boolean {
  if (!geburtsdatum) return false;
  const geb = new Date(geburtsdatum);
  if (isNaN(geb.getTime())) return false;
  const heute = new Date();
  let alter = heute.getFullYear() - geb.getFullYear();
  const m = heute.getMonth() - geb.getMonth();
  if (m < 0 || (m === 0 && heute.getDate() < geb.getDate())) alter--;
  return alter < 18;
}
