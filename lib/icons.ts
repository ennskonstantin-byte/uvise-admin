// Eine Quelle für alle Begriffs-Symbole (Glas-3D-Design), 1:1 Port aus
// sicherakte/lib/design/icons.ts. Kein Screen baut Pfade selbst.
// Bedienelemente (Chevron, Menü, Zurück, Häkchen) bleiben lucide-react.
//
// Die PNGs liegen unter public/i3d-hq/ (Kopie aus sicherakte/assets/i3d-hq/).

export const ICON = {
  dashboard: "/i3d-hq/dashboard.png",
  unterweisungen: "/i3d-hq/unterweisungen.png", // auch: offen
  bundle: "/i3d-hq/bundle.png",
  signiert: "/i3d-hq/signiert.png", // auch: Nachweis
  mitarbeiter: "/i3d-hq/mitarbeiter.png",
  rueckfragen: "/i3d-hq/rueckfragen.png",
  qualifikation: "/i3d-hq/qualifikation.png",
  erinnerung: "/i3d-hq/erinnerung.png",
  ueberfaellig: "/i3d-hq/ueberfaellig.png",
  erledigt: "/i3d-hq/erledigt.png",
  geklaert: "/i3d-hq/geklaert.png",
  archiv: "/i3d-hq/archiv.png",
  loeschen: "/i3d-hq/loeschen.png",
  firma: "/i3d-hq/firma.png",
  sifa: "/i3d-hq/sifa.png",
  abo: "/i3d-hq/abo.png",
  aufbewahrungsfrist: "/i3d-hq/aufbewahrungsfrist.png",
  agb: "/i3d-hq/agb.png", // AGB & Datenschutz
  appInfo: "/i3d-hq/appInfo.png",
  einstellungen: "/i3d-hq/einstellungen.png",
  abmelden: "/i3d-hq/abmelden.png",
  meineDaten: "/i3d-hq/meineDaten.png",
  support: "/i3d-hq/support.png",
  verschicken: "/i3d-hq/verschicken.png",
  signieren: "/i3d-hq/signieren.png",
  export: "/i3d-hq/export.png",
  suche: "/i3d-hq/suche.png",
  foto: "/i3d-hq/foto.png",
  neu: "/i3d-hq/neu.png",
  vorlage: "/i3d-hq/vorlage.png",
  wartetAufFreigabe: "/i3d-hq/wartetAufFreigabe.png",
  vorlesen: "/i3d-hq/vorlesen.png",
  sprache: "/i3d-hq/sprache.png",
} as const;

export type IconKey = keyof typeof ICON;

// Unterweisungs-Symbole -- Schlüssel = exakt das Emoji-Zeichen aus
// training.icon (Datenwert bleibt Emoji, nur die Anzeige wechselt).
export const TRAINING_ICON: Record<string, keyof typeof TRAINING_ICON_SRC> = {
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
  hardhat: "/i3d-hq/training/hardhat.png",
  flame: "/i3d-hq/training/flame.png",
  cross: "/i3d-hq/training/cross.png",
  alarm: "/i3d-hq/training/alarm.png",
  vest: "/i3d-hq/training/vest.png",
  hazard: "/i3d-hq/training/hazard.png",
  gear: "/i3d-hq/training/gear.png",
  bolt: "/i3d-hq/training/bolt.png",
  wrench: "/i3d-hq/training/wrench.png",
  liftingPerson: "/i3d-hq/training/liftingPerson.png",
  accidentTriangle: "/i3d-hq/training/accidentTriangle.png",
  car: "/i3d-hq/training/car.png",
  forklift: "/i3d-hq/training/forklift.png",
  pallet: "/i3d-hq/training/pallet.png",
  harness: "/i3d-hq/training/harness.png",
  ladder: "/i3d-hq/training/ladder.png",
  headphones: "/i3d-hq/training/headphones.png",
  handcream: "/i3d-hq/training/handcream.png",
  soap: "/i3d-hq/training/soap.png",
  chair: "/i3d-hq/training/chair.png",
  brain: "/i3d-hq/training/brain.png",
  deskOffice: "/i3d-hq/training/deskOffice.png",
  laptop: "/i3d-hq/training/laptop.png",
  toolbox: "/i3d-hq/training/toolbox.png",
  maintenanceGear: "/i3d-hq/training/maintenanceGear.png",
  crane: "/i3d-hq/training/crane.png",
  transportTrolley: "/i3d-hq/training/transportTrolley.png",
  cleaningBucket: "/i3d-hq/training/cleaningBucket.png",
  noAlcohol: "/i3d-hq/training/noAlcohol.png",
  exitSign: "/i3d-hq/training/exitSign.png",
  shieldCyan: "/i3d-hq/training/shieldCyan.png",
  shieldBlue: "/i3d-hq/training/shieldBlue.png",
  plate: "/i3d-hq/training/plate.png",
  building: "/i3d-hq/training/building.png",
  weld: "/i3d-hq/training/weld.png",
  flask: "/i3d-hq/training/flask.png",
  recycle: "/i3d-hq/training/recycle.png",
  nosmoking: "/i3d-hq/training/nosmoking.png",
  droplet: "/i3d-hq/training/droplet.png",
  ambulance: "/i3d-hq/training/ambulance.png",
  scale: "/i3d-hq/training/scale.png",
  stethoscope: "/i3d-hq/training/stethoscope.png",
  clip: "/i3d-hq/training/clip.png",
  key: "/i3d-hq/training/key.png",
} as const;

export function trainingIconSrc(emoji: string): string | undefined {
  const key = TRAINING_ICON[emoji];
  return key ? TRAINING_ICON_SRC[key] : undefined;
}

// Ziffern-Symbole für "Sonstiges N"-Restplätze.
export const NUMBER_ICON = {
  "1️⃣": "/i3d-hq/numbers/num1.png",
  "2️⃣": "/i3d-hq/numbers/num2.png",
  "3️⃣": "/i3d-hq/numbers/num3.png",
  "4️⃣": "/i3d-hq/numbers/num4.png",
  "5️⃣": "/i3d-hq/numbers/num5.png",
} as const;

// Abteilungs-Symbole -- Schlüssel = das Emoji-Zeichen aus category.icon.
export const CATEGORY_ICON: Record<string, keyof typeof CATEGORY_ICON_SRC> = {
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
};

const CATEGORY_ICON_SRC = {
  pallet: "/i3d-hq/training/pallet.png",
  truckVehicle: "/i3d-hq/category/truckVehicle.png",
  chefHat: "/i3d-hq/category/chefHat.png",
  broom: "/i3d-hq/category/broom.png",
  shieldCyan: "/i3d-hq/training/shieldCyan.png",
  wrench: "/i3d-hq/training/wrench.png",
  building: "/i3d-hq/training/building.png",
  shoppingCart: "/i3d-hq/category/shoppingCart.png",
  flask: "/i3d-hq/training/flask.png",
  forklift: "/i3d-hq/training/forklift.png",
  medal: "/i3d-hq/category/medal.png",
  star: "/i3d-hq/category/star.png",
  monitor: "/i3d-hq/category/monitor.png",
  stethoscope: "/i3d-hq/training/stethoscope.png",
  backpack: "/i3d-hq/category/backpack.png",
  bell: "/i3d-hq/category/bell.png",
} as const;

export function categoryIconSrc(emoji: string): string | undefined {
  if (emoji in NUMBER_ICON) return NUMBER_ICON[emoji as keyof typeof NUMBER_ICON];
  const key = CATEGORY_ICON[emoji];
  return key ? CATEGORY_ICON_SRC[key] : undefined;
}

// Qualifikations-Abzeichen -- bewusst als Glas-Medaillon gestaltet.
export const QUALIFICATION_ICON: Record<string, keyof typeof QUALIFICATION_ICON_SRC> = {
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
};

const QUALIFICATION_ICON_SRC = {
  medicalCross: "/i3d-hq/qualification/medicalCross.png",
  ambulanceCross: "/i3d-hq/qualification/ambulanceCross.png",
  flame: "/i3d-hq/qualification/flame.png",
  exitRun: "/i3d-hq/qualification/exitRun.png",
  shieldCheck: "/i3d-hq/qualification/shieldCheck.png",
  forklift: "/i3d-hq/qualification/forklift.png",
  crane: "/i3d-hq/qualification/crane.png",
  liftPlatform: "/i3d-hq/qualification/liftPlatform.png",
  telehandler: "/i3d-hq/qualification/telehandler.png",
  excavator: "/i3d-hq/qualification/excavator.png",
  sling: "/i3d-hq/qualification/sling.png",
  gasMask: "/i3d-hq/qualification/gasMask.png",
  harness: "/i3d-hq/qualification/harness.png",
  hazard: "/i3d-hq/qualification/hazard.png",
  laser: "/i3d-hq/qualification/laser.png",
  radiation: "/i3d-hq/qualification/radiation.png",
  bolt: "/i3d-hq/qualification/bolt.png",
  shieldLock: "/i3d-hq/qualification/shieldLock.png",
  soap: "/i3d-hq/qualification/soap.png",
  recycle: "/i3d-hq/qualification/recycle.png",
  droplet: "/i3d-hq/qualification/droplet.png",
  emissionFilter: "/i3d-hq/qualification/emissionFilter.png",
  biohazard: "/i3d-hq/qualification/biohazard.png",
  adrDiamond: "/i3d-hq/qualification/adrDiamond.png",
} as const;

export function qualificationIconSrc(emoji: string): string | undefined {
  if (emoji in NUMBER_ICON) return NUMBER_ICON[emoji as keyof typeof NUMBER_ICON];
  const key = QUALIFICATION_ICON[emoji];
  return key ? QUALIFICATION_ICON_SRC[key] : undefined;
}
