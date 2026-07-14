// Login-Adressen, die die Betreiber-Ansichten (Besucherstatistik, Marketing)
// sehen dürfen — das ist bewusst KEINE Kundenfunktion, sondern nur für den
// uVise-Betreiber selbst. Die Test-Chef-Adresse ist mit drin, damit sich die
// Ansicht auch über das Testkonto prüfen lässt; vor dem echten Start entfernen.
export const OWNER_EMAILS = ["ennskonstantin@gmail.com", "chef.nord@example.com"];

export function isOwnerEmail(email: string | null | undefined): boolean {
  return !!email && OWNER_EMAILS.includes(email.toLowerCase());
}
