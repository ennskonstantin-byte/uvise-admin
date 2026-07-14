// Login-Adressen, die die Betreiber-Ansichten (Überwachung, Statistik,
// Marketing, Partner) sehen und deren geschützte Server-Routen aufrufen
// dürfen — das ist bewusst KEINE Kundenfunktion, sondern nur für den
// uVise-Betreiber. Aktuell exakt eine Adresse: nur dieser Login hat Zugriff.
export const OWNER_EMAILS = ["info@ennsmedia.com"];

export function isOwnerEmail(email: string | null | undefined): boolean {
  return !!email && OWNER_EMAILS.includes(email.toLowerCase());
}
