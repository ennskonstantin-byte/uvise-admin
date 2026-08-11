// Ab wie vielen Tagen vor Ablauf eine Qualifikation/Unterweisung als
// „läuft bald ab" (gelb) gilt. Zentrale Konstante statt Magic Number an
// mehreren Stellen (Runde-3-Audit, N-10).
export const AMPEL_WARN_TAGE = 30;

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
  // Für optimistic locking in updateEmployee() -- verhindert stillschweigendes
  // last-write-wins bei paralleler Bearbeitung (z.B. Chef-Web + Chef-App
  // gleichzeitig offen). Reiner Änderungs-Zähler (Migration 0064), NICHT
  // updated_at: ein Zeitstempel änderte sich auch bei rein technischen
  // Schreibvorgängen und löste dadurch Konflikt-Meldungen aus, obwohl
  // niemand etwas geändert hatte.
  version: number;
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

export type Training = {
  id: string;
  name: string;
  typ: "hochgeladen" | "online";
  icon: string;
  inhalt: string | null;
  // Pfad im privaten "training-documents"-Bucket (nicht die fertige URL —
  // die App erzeugt beim Anzeigen eine zeitlich begrenzte signierte URL).
  pdfPath: string | null;
  erstelltAm: string;
  ablaufdatum: string;
  status: "aktuell" | "laeuft_ab" | "abgelaufen";
  // Für optimistic locking in updateTraining(), s. Employee.version.
  version: number;
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

export type EmployeeTraining = {
  id: string;
  employeeId: string;
  trainingId: string;
  status: "offen" | "signiert" | "abgelehnt" | "anonymisiert";
  signiertAm: string | null;
  signaturBildUrl: string | null;
  geraet: string | null;
  signaturHash: string | null;
  // Name des Mitarbeiters zum Signierzeitpunkt (Migration 0040) — bleibt bei
  // späteren Namensänderungen unverändert. Bei Alt-Nachweisen (vor 0040) null.
  signiertAls: string | null;
  ablaufdatumIso: string | null;
};

export type Bundle = {
  id: string;
  name: string;
  icon: string;
  trainingIds: string[];
};

export type Qualification = {
  id: string;
  employeeId: string;
  name: string;
  icon: string;
  ablaufdatum: string;
  // Rohes ISO-Datum (oder null) zum Vorbefüllen des Bearbeiten-Dialogs.
  ablaufdatumIso: string | null;
  status: "gueltig" | "laeuft_ab" | "abgelaufen";
  // [Erinnerungs-Flow] Qualifikationen sind bewusst KEIN Signatur-Feature --
  // nur eine Erinnerung. Diese beiden Zeitstempel steuern, ob die Erinnerung
  // gerade ruht (s. istErinnerungFaellig unten).
  terminVereinbartAm: string | null;
  naechsteErinnerungAm: string | null;
};

// Ist die Erinnerung für eine Qualifikation gerade aktiv (nicht durch
// "Termin vereinbart"/"Nochmal erinnern" stummgeschaltet)? Zentral, damit
// Mitarbeiter-App, Chef-App und Web-Dashboard dieselbe Regel anwenden.
export function istErinnerungFaellig(q: {
  ablaufdatumIso: string | null;
  terminVereinbartAm: string | null;
  naechsteErinnerungAm: string | null;
}): boolean {
  if (!q.ablaufdatumIso) return false;
  const tageBisAblauf = (new Date(q.ablaufdatumIso).getTime() - Date.now()) / 86_400_000;
  if (tageBisAblauf >= AMPEL_WARN_TAGE) return false;
  if (q.terminVereinbartAm && tageBisAblauf >= 0) return false;
  if (q.naechsteErinnerungAm && new Date(q.naechsteErinnerungAm).getTime() > Date.now()) return false;
  return true;
}

export type Question = {
  id: string;
  employeeId: string;
  trainingId: string;
  frage: string;
  antwort: string | null;
  status: "offen" | "beantwortet";
  gestelltAm: string;
};

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

// Gängige Qualifikationen mit bunten, gut erkennbaren Symbolen.
// Bewusst NUR Qualifikationen, die ablaufen bzw. regelmäßig aufgefrischt
// werden müssen — Abschlüsse ohne Ablaufdatum (Meister, AEVO, SiFa …) sind
// raus, weil das Produkt mit Fristen und Erinnerungen arbeitet.
export const QUALIFICATION_PRESETS: { name: string; icon: string }[] = [
  { name: "Ersthelfer", icon: "⛑️" },
  { name: "Brandschutzhelfer", icon: "🧯" },
  { name: "Staplerschein", icon: "🚜" },
  { name: "Kranführer", icon: "🏗️" },
  { name: "LKW-Führerschein (C/CE)", icon: "🚛" },
  { name: "Führerschein (B)", icon: "🚗" },
  { name: "Hubarbeitsbühne", icon: "🪜" },
  { name: "Motorsägenschein", icon: "🪚" },
  { name: "Schweißerprüfung", icon: "🔥" },
  { name: "Gefahrgut (ADR)", icon: "☣️" },
  { name: "Hygieneschulung (§43)", icon: "🧼" },
  { name: "Ladungssicherung", icon: "📦" },
  { name: "Höhentauglichkeit (G41)", icon: "🧗" },
  { name: "Atemschutz (G26)", icon: "😷" },
  { name: "Fahrtauglichkeit (G25)", icon: "🚦" },
  { name: "Atemwege-Vorsorge (G23)", icon: "🫁" },
  { name: "Betriebssanitäter", icon: "🚑" },
  // Neutrale Nummern-Einträge: falls nichts Passendes dabei ist, wählt man
  // eine Nummer und schreibt den echten Namen ins Freitextfeld.
  { name: "Eigene Qualifikation 1", icon: "1️⃣" },
  { name: "Eigene Qualifikation 2", icon: "2️⃣" },
  { name: "Eigene Qualifikation 3", icon: "3️⃣" },
  { name: "Eigene Qualifikation 4", icon: "4️⃣" },
  { name: "Eigene Qualifikation 5", icon: "5️⃣" },
];

export function qualIcon(name: string): string {
  return QUALIFICATION_PRESETS.find((q) => q.name === name)?.icon ?? "📋";
}

// [E1/E2, Vertragsmodell-Umstellung] Kein Jahres-Vorkasse-Preis mehr -- jeder
// Vertrag läuft 12 Monate mit monatlicher Zahlung (siehe lib/contractTerm.ts).
// Chef-/Admin-Zugang ist in jedem Paket gratis und zählt nicht ins
// Mitarbeiter-Limit (siehe chefGratisHinweis).
export const PLANS = [
  {
    name: "Team",
    preis: "49",
    limit: "bis 10 Mitarbeiter",
    // Numerischer Wert derselben Grenze — einzige Quelle der Wahrheit für
    // stripe-webhook/route.ts (schreibt companies.employee_limit) und den
    // DB-Trigger employees_enforce_limit() (Migration 0073 im sicherakte-Repo).
    mitarbeiterLimit: 10,
    features: ["Unterweisungen & Fristen", "Ampelsystem & Badges", "E-Mail- & App-Push-Erinnerungen"],
  },
  {
    name: "Betrieb",
    preis: "99",
    limit: "bis 25 Mitarbeiter",
    mitarbeiterLimit: 25,
    features: ["Alles aus Team", "Bundle-Vorlagen"],
  },
  {
    name: "Unternehmen",
    preis: "149",
    limit: "bis 50 Mitarbeiter",
    mitarbeiterLimit: 50,
    features: ["Alles aus Betrieb", "Priorisierter Support", "Erweitertes Archiv"],
  },
];

// Hinweistext für alle Preis-Anzeigen: Chef-/Admin-Zugang ist gratis.
export const CHEF_GRATIS_HINWEIS = "Chef-/Admin-Zugang ist immer gratis und zählt nicht ins Mitarbeiter-Limit.";

// Ab wie vielen Mitarbeitern gibt es kein Selbstbedienungs-Paket mehr —
// stattdessen ein "Sprich uns an"-Hinweis mit Link zu /kontakt.
export const ENTERPRISE_KONTAKT = {
  ab: 50,
  text: "Über 50 Mitarbeiter?",
  linkText: "Sprich uns an",
  href: "/kontakt",
};

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
