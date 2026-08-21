// Eine Quelle für alle Begriffs-Symbole (Glas-3D-Design), 1:1 Port aus
// sicherakte/lib/design/icons.ts. Kein Screen baut Pfade selbst.
// Bedienelemente (Chevron, Menü, Zurück, Häkchen) bleiben lucide-react.
//
// Die PNGs liegen unter public/i3d-hq/ (Kopie aus sicherakte/assets/i3d-hq/).

export const ICON = {
  dashboard: "/icons/content/dashboard/dashboard-overview.webp",
  unterweisungen: "/icons/content/dashboard/dashboard-unterweisungen.webp", // auch: offen
  bundle: "/icons/content/dashboard/dashboard-bundle.webp",
  signiert: "/icons/content/dashboard/dashboard-signiert.webp", // auch: Nachweis
  mitarbeiter: "/icons/content/dashboard/dashboard-mitarbeiter.webp",
  rueckfragen: "/icons/content/dashboard/dashboard-rueckfragen.webp",
  qualifikation: "/icons/content/dashboard/dashboard-qualifikation.webp",
  erinnerung: "/icons/content/dashboard/dashboard-erinnerung.webp",
  ueberfaellig: "/icons/content/dashboard/dashboard-ueberfaellig.webp",
  erledigt: "/icons/content/dashboard/dashboard-erledigt.webp",
  geklaert: "/icons/content/dashboard/dashboard-geklaert.webp",
  archiv: "/icons/content/dashboard/dashboard-archiv.webp",
  loeschen: "/icons/content/dashboard/dashboard-loeschen.webp",
  firma: "/icons/content/dashboard/dashboard-firma.webp",
  sifa: "/icons/content/dashboard/dashboard-sifa.webp",
  abo: "/icons/content/dashboard/dashboard-abo.webp",
  aufbewahrungsfrist: "/icons/content/dashboard/dashboard-aufbewahrungsfrist.webp",
  agb: "/icons/content/dashboard/dashboard-agb.webp", // AGB & Datenschutz
  appInfo: "/icons/content/dashboard/dashboard-app-info.webp",
  einstellungen: "/icons/content/dashboard/dashboard-einstellungen.webp",
  abmelden: "/icons/content/dashboard/dashboard-abmelden.webp",
  meineDaten: "/icons/content/dashboard/dashboard-meine-daten.webp",
  support: "/icons/content/dashboard/dashboard-support.webp",
  verschicken: "/icons/content/dashboard/dashboard-verschicken.webp",
  signieren: "/icons/content/dashboard/dashboard-signieren.webp",
  export: "/icons/content/dashboard/dashboard-export.webp",
  suche: "/icons/content/dashboard/dashboard-suche.webp",
  foto: "/icons/content/dashboard/dashboard-foto.webp",
  neu: "/icons/content/dashboard/dashboard-neu.webp",
  vorlage: "/icons/content/dashboard/dashboard-vorlage.webp",
  wartetAufFreigabe: "/icons/content/dashboard/dashboard-wartet-auf-freigabe.webp",
  vorlesen: "/icons/content/dashboard/dashboard-vorlesen.webp",
  sprache: "/icons/content/dashboard/dashboard-sprache.webp",
  // [Icon-Nachtrag 12.08.26] Für die Website-Funktionskarte "Ampel-System"
  // (ersetzt das AmpelDots-Platzhalter-Symbol) und die Branche "GaLaBau".
  ampel: "/icons/content/dashboard/dashboard-ampel.webp",
  galabau: "/icons/content/dashboard/dashboard-galabau.webp",
} as const;

export type IconKey = keyof typeof ICON;

// Unterweisungs-Symbole -- Schlüssel = exakt das Emoji-Zeichen aus
// training.icon (Datenwert bleibt Emoji, nur die Anzeige wechselt).
// [Icon-Code-Prep v2 17.08.26 — STEP 2/3, 1:1 Port des App-Fixes] Nicht mehr
// exportiert: diese Emoji→Code-Zuordnung darf nur noch INTERN zur Ermittlung
// eines SemanticIconKey dienen (trainingSemanticKeyFor unten), niemals mehr
// direkt als Bildquelle eines Screens.
const TRAINING_ICON: Record<string, keyof typeof TRAINING_ICON_SRC> = {
  "⛑️": "hardhat",
  "🔥": "flame",
  "✚": "cross",
  "🚨": "alarm",
  "🦺": "vest",
  "☣️": "hazard",
  "⚙️": "gear",
  "⚡": "bolt",
  "🛠️": "wrench",
  "🏋️": "liftingPerson",
  "⚠️": "accidentTriangle",
  "🚗": "car",
  "🚛": "forklift",
  "📦": "pallet",
  "🪢": "harness",
  "🪜": "ladder",
  "🎧": "headphones",
  "🧴": "handcream",
  "🧼": "soap",
  "🪑": "chair",
  "🧠": "brain",
  "💼": "deskOffice",
  "🏠": "laptop",
  "🧰": "toolbox",
  "🔩": "maintenanceGear",
  "🚜": "crane",
  "🚚": "transportTrolley",
  "🪣": "cleaningBucket",
  "🚫": "noAlcohol",
  "🏃": "exitSign",
  "🔒": "shieldCyan",
  "💻": "shieldBlue",
  "🍽️": "plate",
  "🏗️": "building",
  "🧯": "weld",
  "🧪": "flask",
  "♻️": "recycle",
  "🚭": "nosmoking",
  "💧": "droplet",
  "🚑": "ambulance",
  "⚖️": "scale",
  "🩺": "stethoscope",
  "📋": "clip",
  "🔑": "key",
  "🪖": "vest",
  "🩹": "cross",
};

const TRAINING_ICON_SRC = {
  hardhat: "/icons/content/trainings/training-hardhat.webp",
  flame: "/icons/content/trainings/training-flame.webp",
  cross: "/icons/content/trainings/training-cross.webp",
  alarm: "/icons/content/trainings/training-alarm.webp",
  vest: "/icons/content/trainings/training-vest.webp",
  hazard: "/icons/content/trainings/training-hazard.webp",
  gear: "/icons/content/trainings/training-gear.webp",
  bolt: "/icons/content/trainings/training-bolt.webp",
  wrench: "/icons/content/trainings/training-wrench.webp",
  liftingPerson: "/icons/content/trainings/training-lifting-person.webp",
  accidentTriangle: "/icons/content/trainings/training-accident-triangle.webp",
  car: "/icons/content/trainings/training-car.webp",
  forklift: "/icons/content/trainings/training-forklift.webp",
  pallet: "/icons/content/trainings/training-pallet.webp",
  harness: "/icons/content/trainings/training-harness.webp",
  ladder: "/icons/content/trainings/training-ladder.webp",
  headphones: "/icons/content/trainings/training-headphones.webp",
  handcream: "/icons/content/trainings/training-handcream.webp",
  soap: "/icons/content/trainings/training-soap.webp",
  chair: "/icons/content/trainings/training-chair.webp",
  brain: "/icons/content/trainings/training-brain.webp",
  deskOffice: "/icons/content/trainings/training-desk-office.webp",
  laptop: "/icons/content/trainings/training-laptop.webp",
  toolbox: "/icons/content/trainings/training-toolbox.webp",
  maintenanceGear: "/icons/content/trainings/training-maintenance-gear.webp",
  crane: "/icons/content/trainings/training-crane.webp",
  transportTrolley: "/icons/content/trainings/training-transport-trolley.webp",
  cleaningBucket: "/icons/content/trainings/training-cleaning-bucket.webp",
  noAlcohol: "/icons/content/trainings/training-no-alcohol.webp",
  exitSign: "/icons/content/trainings/training-exit-sign.webp",
  shieldCyan: "/icons/content/trainings/training-shield-cyan.webp",
  shieldBlue: "/icons/content/trainings/training-shield-blue.webp",
  plate: "/icons/content/trainings/training-plate.webp",
  building: "/icons/content/trainings/training-building.webp",
  weld: "/icons/content/trainings/training-weld.webp",
  flask: "/icons/content/trainings/training-flask.webp",
  recycle: "/icons/content/trainings/training-recycle.webp",
  nosmoking: "/icons/content/trainings/training-nosmoking.webp",
  droplet: "/icons/content/trainings/training-droplet.webp",
  ambulance: "/icons/content/trainings/training-ambulance.webp",
  scale: "/icons/content/trainings/training-scale.webp",
  stethoscope: "/icons/content/trainings/training-stethoscope.webp",
  clip: "/icons/content/trainings/training-clip.webp",
  key: "/icons/content/trainings/training-key.webp",
} as const;

// [Icon-Code-Prep v2 17.08.26 — STEP 2/3] Emoji → SemanticIconKey (NICHT
// mehr Emoji → Bild direkt). Einziger Weg zu einem Trainings-Bild:
// resolveDynamicIcon() → diese Funktion → resolveSemanticIcon().
function trainingSemanticKeyFor(emoji: string): SemanticIconKey | undefined {
  const code = TRAINING_ICON[emoji];
  return code ? (`training.${code}` as SemanticIconKey) : undefined;
}

// [Icon-Code-Phase 17.08.26] 1:1 Port der App-Erweiterung (sicherakte/lib/design/icons.ts).
export function trainingIconByCode(key: keyof typeof TRAINING_ICON_SRC): string {
  return TRAINING_ICON_SRC[key];
}

// Ziffern-Symbole für "Sonstiges N"-Restplätze — [v3, P1-4, 18.08.26, 1:1
// Port des App-Umbaus] ZWEI getrennte Tabellen mit getrennten physischen
// Dateien statt der früheren geteilten NUMBER_ICON-Tabelle. Die
// Kategorie-Kopien (category-numbers/) sind Byte-Kopien — kein neues Bild.
const QUALIFICATION_NUMBER_ICON = {
  "1️⃣": "/icons/content/qualifications/qualification-number1.webp",
  "2️⃣": "/icons/content/qualifications/qualification-number2.webp",
  "3️⃣": "/icons/content/qualifications/qualification-number3.webp",
  "4️⃣": "/icons/content/qualifications/qualification-number4.webp",
  "5️⃣": "/icons/content/qualifications/qualification-number5.webp",
} as const;

const CATEGORY_NUMBER_ICON = {
  "1️⃣": "/icons/content/categories/category-number1.webp",
  "2️⃣": "/icons/content/categories/category-number2.webp",
  "3️⃣": "/icons/content/categories/category-number3.webp",
  "4️⃣": "/icons/content/categories/category-number4.webp",
  "5️⃣": "/icons/content/categories/category-number5.webp",
} as const;

const NUMBER_EMOJI_INDEX: Record<string, 1 | 2 | 3 | 4 | 5> = {
  "1️⃣": 1,
  "2️⃣": 2,
  "3️⃣": 3,
  "4️⃣": 4,
  "5️⃣": 5,
};

// Abteilungs-Symbole -- Schlüssel = das Emoji-Zeichen aus category.icon.
// [Icon-Code-Prep v2 17.08.26 — STEP 2/3] Nicht mehr exportiert, s. Kommentar
// bei TRAINING_ICON oben.
const CATEGORY_ICON: Record<string, keyof typeof CATEGORY_ICON_SRC> = {
  "📦": "pallet",
  "🚚": "truckVehicle",
  "🍳": "chefHat",
  "🧹": "broom",
  "🛡️": "shieldCyan",
  "🔧": "wrench",
  "🏗️": "building",
  "🛒": "shoppingCart",
  "🧪": "flask",
  "🚜": "forklift",
  "🏅": "medal",
  "⭐": "star",
  "🖥️": "monitor",
  "🩺": "stethoscope",
  "🎒": "backpack",
  "🔔": "bell",
  // Paritäts-Fix 17.08.26: Alt-Kategorien-Mappings aus der App übernommen
  // (sicherakte/lib/design/icons.ts, KE 13.08.26) — ohne diese zeigten
  // Alt-Kategorien mit 🗂️/👔/🏭 im Web rohes Emoji statt PNG.
  "🗂️": "monitor", // Büro
  "👔": "star", // Leitung
  "🏭": "building", // Produktion
  // [Icon-Code-Prep v2 17.08.26 — STEP 4, 1:1 Port des App-Fixes] Bundle-Icon-
  // Emoji (lib/types.ts BUNDLE_ICONS) — fehlten hier komplett, obwohl
  // resolveSemanticIcon bereits eigene category.worker/phone/briefcase/
  // receipt/people-Keys dafür hatte (echter Fund des adversariellen
  // Web-Audits, STEP 25).
  "👷": "worker", // Handwerk (Bundle-Icon)
  "📞": "phone", // Kundenservice (Bundle-Icon)
  "💼": "briefcase", // Vertrieb/Außendienst (Bundle-Icon)
  "🧾": "receipt", // Einkauf/Buchhaltung (Bundle-Icon)
  "👥": "people", // Personal/HR (Bundle-Icon)
};

// [v3, P1-4, 18.08.26, 1:1 Port des App-Umbaus] Die Kategorie-Familie
// besitzt jetzt ALLE ihre Dateien selbst (public/i3d-hq/category/) — die 7
// frueher mit Training geteilten Motive + die 5 Bundle-Platzhalter liegen
// als Byte-Kopien im eigenen Familienordner. Kein Kategorie-Key ist mehr
// physisch mit einer anderen Familie verkoppelt.
const CATEGORY_ICON_SRC = {
  pallet: "/icons/content/categories/category-pallet.webp",
  truckVehicle: "/icons/content/categories/category-truck-vehicle.webp",
  chefHat: "/icons/content/categories/category-chef-hat.webp",
  broom: "/icons/content/categories/category-broom.webp",
  shieldCyan: "/icons/content/categories/category-shield-cyan.webp",
  wrench: "/icons/content/categories/category-wrench.webp",
  building: "/icons/content/categories/category-building.webp",
  shoppingCart: "/icons/content/categories/category-shopping-cart.webp",
  flask: "/icons/content/categories/category-flask.webp",
  forklift: "/icons/content/categories/category-forklift.webp",
  medal: "/icons/content/categories/category-medal.webp",
  star: "/icons/content/categories/category-star.webp",
  monitor: "/icons/content/categories/category-monitor.webp",
  stethoscope: "/icons/content/categories/category-stethoscope.webp",
  backpack: "/icons/content/categories/category-backpack.webp",
  bell: "/icons/content/categories/category-bell.webp",
  // [Icon-Code-Prep v2 17.08.26 — STEP 4] Platzhalter fuer die 5 neuen
  // Kategorie-Bundle-Keys (LEGACY_ACCEPTED_UNTIL_FINAL_SWAP, kein neues Asset
  // erzeugt) -- s. Kommentar bei CATEGORY_ICON oben.
  worker: "/icons/content/categories/category-worker.webp",
  phone: "/icons/content/categories/category-phone.webp",
  briefcase: "/icons/content/categories/category-briefcase.webp",
  receipt: "/icons/content/categories/category-receipt.webp",
  people: "/icons/content/categories/category-people.webp",
} as const;

// [Icon-Code-Prep v2 17.08.26 — STEP 2/3/9] Emoji → SemanticIconKey. Die
// Ziffern-Emoji (1️⃣–5️⃣) sind zwischen Kategorie und Qualifikation geteilt —
// welche Familie gemeint ist, entscheidet der `family`-Wert am
// resolveDynamicIcon()-Aufruf, nicht das Emoji selbst.
function categorySemanticKeyFor(emoji: string): SemanticIconKey | undefined {
  if (emoji in CATEGORY_NUMBER_ICON) return `category.number${NUMBER_EMOJI_INDEX[emoji]}` as SemanticIconKey;
  const code = CATEGORY_ICON[emoji];
  return code ? (`category.${code}` as SemanticIconKey) : undefined;
}

export function categoryIconByCode(key: keyof typeof CATEGORY_ICON_SRC): string {
  return CATEGORY_ICON_SRC[key];
}

// [v3, P1-4] Vollständig getrennte Ziffern-Auflösung — jede Familie liest
// aus IHRER Tabelle mit IHREN Dateien (numbers/ bzw. category-numbers/).
export function qualificationNumberIconSrc(n: 1 | 2 | 3 | 4 | 5): string {
  return QUALIFICATION_NUMBER_ICON[`${n}️⃣` as keyof typeof QUALIFICATION_NUMBER_ICON];
}
export function categoryNumberIconSrc(n: 1 | 2 | 3 | 4 | 5): string {
  return CATEGORY_NUMBER_ICON[`${n}️⃣` as keyof typeof CATEGORY_NUMBER_ICON];
}

// Qualifikations-Abzeichen -- bewusst als Glas-Medaillon gestaltet.
// [Icon-Code-Prep v2 17.08.26 — STEP 2/3] Nicht mehr exportiert, s. Kommentar
// bei TRAINING_ICON oben.
const QUALIFICATION_ICON: Record<string, keyof typeof QUALIFICATION_ICON_SRC> = {
  "✚": "medicalCross",
  "🚑": "ambulanceCross",
  "🔥": "flame",
  "🏃": "exitRun",
  "🛡️": "shieldCheck",
  "🚜": "forklift",
  "🏗️": "crane",
  "🪜": "liftPlatform",
  "🚛": "telehandler",
  "🚧": "excavator",
  "⛓️": "sling",
  "😷": "gasMask",
  "🧗": "harness",
  "☣️": "hazard",
  "🔴": "laser",
  "☢️": "radiation",
  "⚡": "bolt",
  "🔒": "shieldLock",
  "🧼": "soap",
  "♻️": "recycle",
  "💧": "droplet",
  "🏭": "emissionFilter",
  "🦠": "biohazard",
  "🔶": "adrDiamond",
  // [Icon-Nachtrag 17.08.26] 7 QUALIFICATION_PRESETS-Emoji (Web lib/types.ts,
  // App chef/lib/types.ts) fehlten hier komplett -> zeigten rohes Emoji statt
  // Abzeichen. 4 davon teilen sich ein motivlich passendes VORHANDENES
  // Abzeichen (kein neues Asset, gleiches Verfahren wie bei Kranführer/
  // Ladekranführer = "crane"):
  "⛑️": "medicalCross", // Ersthelfer ~ Betrieblicher Ersthelfer (identisches Motiv)
  "🧯": "flame", // Brandschutzhelfer ~ Brandschutzhelfer/-beauftragter (identisches Motiv)
  "📦": "sling", // Ladungssicherung ~ Anschläger von Lasten (Lastsicherung, motivnah)
  "🫁": "gasMask", // Atemwege-Vorsorge (G23) ~ Atemschutzgeräteträger (Atemwege-Motiv)
  // 🚗 Führerschein B, 🪚 Motorsägenschein, 🚦 Fahrtauglichkeit (G25) haben
  // KEIN passendes Abzeichen-Motiv unter den 24 vorhandenen Codes -- s.
  // qualificationSemanticKeyFor unten (generisches dashboard.qualifikation-
  // Medaillon statt irreführendem Spezial-Motiv; braucht eigene Zeilen in
  // design-uvise-glass/ICON_SWAP_MANIFEST.csv, sobald echte Motive beauftragt werden).
};

const QUALIFICATION_ICON_SRC = {
  medicalCross: "/icons/content/qualifications/qualification-medical-cross.webp",
  ambulanceCross: "/icons/content/qualifications/qualification-ambulance-cross.webp",
  flame: "/icons/content/qualifications/qualification-flame.webp",
  exitRun: "/icons/content/qualifications/qualification-exit-run.webp",
  shieldCheck: "/icons/content/qualifications/qualification-shield-check.webp",
  forklift: "/icons/content/qualifications/qualification-forklift.webp",
  crane: "/icons/content/qualifications/qualification-crane.webp",
  liftPlatform: "/icons/content/qualifications/qualification-lift-platform.webp",
  telehandler: "/icons/content/qualifications/qualification-telehandler.webp",
  excavator: "/icons/content/qualifications/qualification-excavator.webp",
  sling: "/icons/content/qualifications/qualification-sling.webp",
  gasMask: "/icons/content/qualifications/qualification-gas-mask.webp",
  harness: "/icons/content/qualifications/qualification-harness.webp",
  hazard: "/icons/content/qualifications/qualification-hazard.webp",
  laser: "/icons/content/qualifications/qualification-laser.webp",
  radiation: "/icons/content/qualifications/qualification-radiation.webp",
  bolt: "/icons/content/qualifications/qualification-bolt.webp",
  shieldLock: "/icons/content/qualifications/qualification-shield-lock.webp",
  soap: "/icons/content/qualifications/qualification-soap.webp",
  recycle: "/icons/content/qualifications/qualification-recycle.webp",
  droplet: "/icons/content/qualifications/qualification-droplet.webp",
  emissionFilter: "/icons/content/qualifications/qualification-emission-filter.webp",
  biohazard: "/icons/content/qualifications/qualification-biohazard.webp",
  adrDiamond: "/icons/content/qualifications/qualification-adr-diamond.webp",
} as const;

// [Icon-Code-Prep v2 17.08.26 — STEP 2/3/9] Emoji → SemanticIconKey, s.
// Kommentar bei categorySemanticKeyFor oben (gleiche Ziffern-Trennung).
function qualificationSemanticKeyFor(emoji: string): SemanticIconKey | undefined {
  if (emoji in QUALIFICATION_NUMBER_ICON) return `qualification.number${NUMBER_EMOJI_INDEX[emoji]}` as SemanticIconKey;
  // [Icon-Nachtrag 17.08.26] 🚗/🪚/🚦 haben kein eigenes Qualifikations-
  // Abzeichen-Motiv (s. Kommentar bei QUALIFICATION_ICON oben) -- zeigen bis
  // zur Asset-Lieferung das bereits vorhandene generische Qualifikations-
  // Medaillon (dashboard.qualifikation, kein neuer SemanticIconKey nötig).
  if (emoji === "🚗" || emoji === "🪚" || emoji === "🚦") return "dashboard.qualifikation";
  const code = QUALIFICATION_ICON[emoji];
  return code ? (`qualification.${code}` as SemanticIconKey) : undefined;
}

export function qualificationIconByCode(key: keyof typeof QUALIFICATION_ICON_SRC): string {
  return QUALIFICATION_ICON_SRC[key];
}

// [Icon-Code-Prep v2 17.08.26 — STEP 2] Einziger Aufrufweg für Screens mit
// einem zur Laufzeit aus einem DB-Wert kommenden Icon: Fachwert →
// *SemanticKeyFor() → SemanticIconKey → resolveSemanticIcon(). Ersetzt den
// direkten Aufruf von trainingIconSrc/categoryIconSrc/qualificationIconSrc
// in Screens (P0-Korrekturfund: die semantische Schicht war zuvor nie im
// Live-Renderpfad verdrahtet).
export type DynamicIconFamily = 'training' | 'category' | 'qualification';
export function resolveDynamicIcon(family: DynamicIconFamily, value: string): string | undefined {
  const key =
    family === 'training'
      ? trainingSemanticKeyFor(value)
      : family === 'category'
        ? categorySemanticKeyFor(value)
        : qualificationSemanticKeyFor(value);
  return key ? resolveSemanticIcon(key) : undefined;
}

// ============================================================================
// [Icon-Code-Phase 17.08.26] Zentrale semantische Icon-Schicht (STEP 2/3/20/25)
// ============================================================================
// 1:1 Port von sicherakte/lib/design/icons.ts — dieselben 134 Keys, generiert
// aus derselben Quelle (design-uvise-glass/ICON_SWAP_MANIFEST.csv). Laeuft
// heute vollstaendig auf den bestehenden Alt-Assets (public/i3d-hq/**), kein
// Pfad auf eine der 134 zukuenftigen, noch nicht existierenden Dateien.
//
// empty.* / ui.* — bewusst NICHT Teil dieser Bild-Registry (v2, 1:1 Port des
// App-Fixes): Leerzustände zeigen dasselbe dashboard.*-Icon wie ihr
// Inhaltsbereich (kein zweites Symbol pro Begriff), Bedienelemente bleiben
// lucide-react — es gibt deshalb keine separate empty.*/ui.*-Familie und
// keine Keys über die 134 Produktionsassets hinaus.

export type SemanticIconKey =
  | 'dashboard.unterweisungen'
  | 'dashboard.qualifikation'
  | 'dashboard.erinnerung'
  | 'qualification.number1'
  | 'qualification.number2'
  | 'qualification.number3'
  | 'qualification.number4'
  | 'qualification.number5'
  | 'category.worker'
  | 'category.phone'
  | 'category.briefcase'
  | 'category.receipt'
  | 'category.people'
  | 'category.number1'
  | 'category.number2'
  | 'category.number3'
  | 'category.number4'
  | 'category.number5'
  | 'dashboard.overview'
  | 'dashboard.bundle'
  | 'dashboard.signiert'
  | 'dashboard.mitarbeiter'
  | 'dashboard.rueckfragen'
  | 'dashboard.ueberfaellig'
  | 'dashboard.erledigt'
  | 'dashboard.geklaert'
  | 'dashboard.archiv'
  | 'dashboard.loeschen'
  | 'dashboard.firma'
  | 'dashboard.sifa'
  | 'dashboard.abo'
  | 'dashboard.aufbewahrungsfrist'
  | 'dashboard.agb'
  | 'dashboard.appInfo'
  | 'dashboard.einstellungen'
  | 'dashboard.abmelden'
  | 'dashboard.meineDaten'
  | 'dashboard.support'
  | 'dashboard.verschicken'
  | 'dashboard.signieren'
  | 'dashboard.export'
  | 'dashboard.suche'
  | 'dashboard.foto'
  | 'dashboard.neu'
  | 'dashboard.vorlage'
  | 'dashboard.wartetAufFreigabe'
  | 'dashboard.vorlesen'
  | 'dashboard.sprache'
  | 'dashboard.ampel'
  | 'dashboard.galabau'
  | 'training.hardhat'
  | 'training.flame'
  | 'training.cross'
  | 'training.alarm'
  | 'training.vest'
  | 'training.hazard'
  | 'training.gear'
  | 'training.bolt'
  | 'training.wrench'
  | 'training.liftingPerson'
  | 'training.accidentTriangle'
  | 'training.car'
  | 'training.forklift'
  | 'training.pallet'
  | 'training.harness'
  | 'training.ladder'
  | 'training.headphones'
  | 'training.handcream'
  | 'training.soap'
  | 'training.chair'
  | 'training.brain'
  | 'training.deskOffice'
  | 'training.laptop'
  | 'training.toolbox'
  | 'training.maintenanceGear'
  | 'training.crane'
  | 'training.transportTrolley'
  | 'training.cleaningBucket'
  | 'training.noAlcohol'
  | 'training.exitSign'
  | 'training.shieldCyan'
  | 'training.shieldBlue'
  | 'training.plate'
  | 'training.building'
  | 'training.weld'
  | 'training.flask'
  | 'training.recycle'
  | 'training.nosmoking'
  | 'training.droplet'
  | 'training.ambulance'
  | 'training.scale'
  | 'training.stethoscope'
  | 'training.clip'
  | 'training.key'
  | 'qualification.medicalCross'
  | 'qualification.ambulanceCross'
  | 'qualification.flame'
  | 'qualification.exitRun'
  | 'qualification.shieldCheck'
  | 'qualification.forklift'
  | 'qualification.crane'
  | 'qualification.liftPlatform'
  | 'qualification.telehandler'
  | 'qualification.excavator'
  | 'qualification.sling'
  | 'qualification.gasMask'
  | 'qualification.harness'
  | 'qualification.hazard'
  | 'qualification.laser'
  | 'qualification.radiation'
  | 'qualification.bolt'
  | 'qualification.shieldLock'
  | 'qualification.soap'
  | 'qualification.recycle'
  | 'qualification.droplet'
  | 'qualification.emissionFilter'
  | 'qualification.biohazard'
  | 'qualification.adrDiamond'
  | 'category.pallet'
  | 'category.truckVehicle'
  | 'category.chefHat'
  | 'category.broom'
  | 'category.shieldCyan'
  | 'category.wrench'
  | 'category.building'
  | 'category.shoppingCart'
  | 'category.flask'
  | 'category.forklift'
  | 'category.medal'
  | 'category.star'
  | 'category.monitor'
  | 'category.stethoscope'
  | 'category.backpack'
  | 'category.bell';

export function resolveSemanticIcon(key: SemanticIconKey): string | undefined {
  switch (key) {
    case 'dashboard.unterweisungen': return ICON['unterweisungen' as IconKey];
    case 'dashboard.qualifikation': return ICON['qualifikation' as IconKey];
    case 'dashboard.erinnerung': return ICON['erinnerung' as IconKey];
    case 'qualification.number1': return qualificationNumberIconSrc(1);
    case 'qualification.number2': return qualificationNumberIconSrc(2);
    case 'qualification.number3': return qualificationNumberIconSrc(3);
    case 'qualification.number4': return qualificationNumberIconSrc(4);
    case 'qualification.number5': return qualificationNumberIconSrc(5);
    // [Icon-Code-Prep v2 17.08.26 — STEP 4, 1:1 Port des App-Fixes]
    // LEGACY_ACCEPTED_UNTIL_FINAL_SWAP: temporäre, motivlich naheliegende
    // Platzhalter aus bestehenden Assets (kein neues Bild erzeugt). Laufen
    // jetzt wie alle übrigen category.*-Keys über categoryIconByCode
    // (CATEGORY_ICON/_SRC wurden um die 5 Bundle-Emoji ergänzt).
    case 'category.worker': return categoryIconByCode('worker'); // 👷 Handwerk ~ Schutzhelm
    case 'category.phone': return categoryIconByCode('phone'); // 📞 Kundenservice ~ Support & Hilfe
    case 'category.briefcase': return categoryIconByCode('briefcase'); // 💼 Vertrieb/Außendienst ~ Büro
    case 'category.receipt': return categoryIconByCode('receipt'); // 🧾 Einkauf/Buchhaltung ~ Abo & Abrechnung
    case 'category.people': return categoryIconByCode('people'); // 👥 Personal/HR ~ Mitarbeiter
    case 'category.number1': return categoryNumberIconSrc(1);
    case 'category.number2': return categoryNumberIconSrc(2);
    case 'category.number3': return categoryNumberIconSrc(3);
    case 'category.number4': return categoryNumberIconSrc(4);
    case 'category.number5': return categoryNumberIconSrc(5);
    case 'dashboard.overview': return ICON['dashboard' as IconKey];
    case 'dashboard.bundle': return ICON['bundle' as IconKey];
    case 'dashboard.signiert': return ICON['signiert' as IconKey];
    case 'dashboard.mitarbeiter': return ICON['mitarbeiter' as IconKey];
    case 'dashboard.rueckfragen': return ICON['rueckfragen' as IconKey];
    case 'dashboard.ueberfaellig': return ICON['ueberfaellig' as IconKey];
    case 'dashboard.erledigt': return ICON['erledigt' as IconKey];
    case 'dashboard.geklaert': return ICON['geklaert' as IconKey];
    case 'dashboard.archiv': return ICON['archiv' as IconKey];
    case 'dashboard.loeschen': return ICON['loeschen' as IconKey];
    case 'dashboard.firma': return ICON['firma' as IconKey];
    case 'dashboard.sifa': return ICON['sifa' as IconKey];
    case 'dashboard.abo': return ICON['abo' as IconKey];
    case 'dashboard.aufbewahrungsfrist': return ICON['aufbewahrungsfrist' as IconKey];
    case 'dashboard.agb': return ICON['agb' as IconKey];
    case 'dashboard.appInfo': return ICON['appInfo' as IconKey];
    case 'dashboard.einstellungen': return ICON['einstellungen' as IconKey];
    case 'dashboard.abmelden': return ICON['abmelden' as IconKey];
    case 'dashboard.meineDaten': return ICON['meineDaten' as IconKey];
    case 'dashboard.support': return ICON['support' as IconKey];
    case 'dashboard.verschicken': return ICON['verschicken' as IconKey];
    case 'dashboard.signieren': return ICON['signieren' as IconKey];
    case 'dashboard.export': return ICON['export' as IconKey];
    case 'dashboard.suche': return ICON['suche' as IconKey];
    case 'dashboard.foto': return ICON['foto' as IconKey];
    case 'dashboard.neu': return ICON['neu' as IconKey];
    case 'dashboard.vorlage': return ICON['vorlage' as IconKey];
    case 'dashboard.wartetAufFreigabe': return ICON['wartetAufFreigabe' as IconKey];
    case 'dashboard.vorlesen': return ICON['vorlesen' as IconKey];
    case 'dashboard.sprache': return ICON['sprache' as IconKey];
    case 'dashboard.ampel': return ICON['ampel' as IconKey];
    case 'dashboard.galabau': return ICON['galabau' as IconKey];
    case 'training.hardhat': return trainingIconByCode('hardhat');
    case 'training.flame': return trainingIconByCode('flame');
    case 'training.cross': return trainingIconByCode('cross');
    case 'training.alarm': return trainingIconByCode('alarm');
    case 'training.vest': return trainingIconByCode('vest');
    case 'training.hazard': return trainingIconByCode('hazard');
    case 'training.gear': return trainingIconByCode('gear');
    case 'training.bolt': return trainingIconByCode('bolt');
    case 'training.wrench': return trainingIconByCode('wrench');
    case 'training.liftingPerson': return trainingIconByCode('liftingPerson');
    case 'training.accidentTriangle': return trainingIconByCode('accidentTriangle');
    case 'training.car': return trainingIconByCode('car');
    case 'training.forklift': return trainingIconByCode('forklift');
    case 'training.pallet': return trainingIconByCode('pallet');
    case 'training.harness': return trainingIconByCode('harness');
    case 'training.ladder': return trainingIconByCode('ladder');
    case 'training.headphones': return trainingIconByCode('headphones');
    case 'training.handcream': return trainingIconByCode('handcream');
    case 'training.soap': return trainingIconByCode('soap');
    case 'training.chair': return trainingIconByCode('chair');
    case 'training.brain': return trainingIconByCode('brain');
    case 'training.deskOffice': return trainingIconByCode('deskOffice');
    case 'training.laptop': return trainingIconByCode('laptop');
    case 'training.toolbox': return trainingIconByCode('toolbox');
    case 'training.maintenanceGear': return trainingIconByCode('maintenanceGear');
    case 'training.crane': return trainingIconByCode('crane');
    case 'training.transportTrolley': return trainingIconByCode('transportTrolley');
    case 'training.cleaningBucket': return trainingIconByCode('cleaningBucket');
    case 'training.noAlcohol': return trainingIconByCode('noAlcohol');
    case 'training.exitSign': return trainingIconByCode('exitSign');
    case 'training.shieldCyan': return trainingIconByCode('shieldCyan');
    case 'training.shieldBlue': return trainingIconByCode('shieldBlue');
    case 'training.plate': return trainingIconByCode('plate');
    case 'training.building': return trainingIconByCode('building');
    case 'training.weld': return trainingIconByCode('weld');
    case 'training.flask': return trainingIconByCode('flask');
    case 'training.recycle': return trainingIconByCode('recycle');
    case 'training.nosmoking': return trainingIconByCode('nosmoking');
    case 'training.droplet': return trainingIconByCode('droplet');
    case 'training.ambulance': return trainingIconByCode('ambulance');
    case 'training.scale': return trainingIconByCode('scale');
    case 'training.stethoscope': return trainingIconByCode('stethoscope');
    case 'training.clip': return trainingIconByCode('clip');
    case 'training.key': return trainingIconByCode('key');
    case 'qualification.medicalCross': return qualificationIconByCode('medicalCross');
    case 'qualification.ambulanceCross': return qualificationIconByCode('ambulanceCross');
    case 'qualification.flame': return qualificationIconByCode('flame');
    case 'qualification.exitRun': return qualificationIconByCode('exitRun');
    case 'qualification.shieldCheck': return qualificationIconByCode('shieldCheck');
    case 'qualification.forklift': return qualificationIconByCode('forklift');
    case 'qualification.crane': return qualificationIconByCode('crane');
    case 'qualification.liftPlatform': return qualificationIconByCode('liftPlatform');
    case 'qualification.telehandler': return qualificationIconByCode('telehandler');
    case 'qualification.excavator': return qualificationIconByCode('excavator');
    case 'qualification.sling': return qualificationIconByCode('sling');
    case 'qualification.gasMask': return qualificationIconByCode('gasMask');
    case 'qualification.harness': return qualificationIconByCode('harness');
    case 'qualification.hazard': return qualificationIconByCode('hazard');
    case 'qualification.laser': return qualificationIconByCode('laser');
    case 'qualification.radiation': return qualificationIconByCode('radiation');
    case 'qualification.bolt': return qualificationIconByCode('bolt');
    case 'qualification.shieldLock': return qualificationIconByCode('shieldLock');
    case 'qualification.soap': return qualificationIconByCode('soap');
    case 'qualification.recycle': return qualificationIconByCode('recycle');
    case 'qualification.droplet': return qualificationIconByCode('droplet');
    case 'qualification.emissionFilter': return qualificationIconByCode('emissionFilter');
    case 'qualification.biohazard': return qualificationIconByCode('biohazard');
    case 'qualification.adrDiamond': return qualificationIconByCode('adrDiamond');
    case 'category.pallet': return categoryIconByCode('pallet');
    case 'category.truckVehicle': return categoryIconByCode('truckVehicle');
    case 'category.chefHat': return categoryIconByCode('chefHat');
    case 'category.broom': return categoryIconByCode('broom');
    case 'category.shieldCyan': return categoryIconByCode('shieldCyan');
    case 'category.wrench': return categoryIconByCode('wrench');
    case 'category.building': return categoryIconByCode('building');
    case 'category.shoppingCart': return categoryIconByCode('shoppingCart');
    case 'category.flask': return categoryIconByCode('flask');
    case 'category.forklift': return categoryIconByCode('forklift');
    case 'category.medal': return categoryIconByCode('medal');
    case 'category.star': return categoryIconByCode('star');
    case 'category.monitor': return categoryIconByCode('monitor');
    case 'category.stethoscope': return categoryIconByCode('stethoscope');
    case 'category.backpack': return categoryIconByCode('backpack');
    case 'category.bell': return categoryIconByCode('bell');
    default: {
      const _exhaustive: never = key;
      return _exhaustive;
    }
  }
}

// ---------------------------------------------------------------------------
// [Phase 8 / Commit 1] Übergangs-Wrapper. Halten die bestehenden Aufrufer
// lauffähig, bis Commit 2 sie auf resolveDynamicIcon() umstellt. Enthalten
// KEINE eigene Auflösungslogik — sie delegieren ausschließlich. Werden in
// Commit 2 ersatzlos entfernt.
// ---------------------------------------------------------------------------
export function trainingIconSrc(emoji: string): string | undefined {
  return resolveDynamicIcon('training', emoji);
}
export function categoryIconSrc(emoji: string): string | undefined {
  return resolveDynamicIcon('category', emoji);
}
export function qualificationIconSrc(emoji: string): string | undefined {
  return resolveDynamicIcon('qualification', emoji);
}
