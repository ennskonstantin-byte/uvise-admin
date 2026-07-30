// Cookie-/Tracking-Einwilligung fürs öffentliche Web (uVise-Marketingseiten +
// Dashboard). Speicherung im localStorage (kein Cookie nötig), analog zum
// bestehenden "uvise-theme"-Muster. Andere Komponenten (z. B. GoogleAnalytics)
// hören per onConsentChange auf Änderungen, damit GA4 ohne Seiten-Reload
// startet, sobald der Nutzer zustimmt.

export type ConsentStatus = "granted" | "denied";

const KEY = "uvise-consent";
const EVENT = "uvise-consent-changed";

export function getConsent(): ConsentStatus | null {
  if (typeof window === "undefined") return null;
  try {
    const v = localStorage.getItem(KEY);
    return v === "granted" || v === "denied" ? v : null;
  } catch {
    return null;
  }
}

export function setConsent(status: ConsentStatus) {
  try {
    localStorage.setItem(KEY, status);
  } catch {
    /* egal, Einwilligung gilt dann nur für diese Sitzung */
  }
  window.dispatchEvent(new CustomEvent<ConsentStatus>(EVENT, { detail: status }));
}

export function onConsentChange(cb: (status: ConsentStatus) => void) {
  const handler = (e: Event) => cb((e as CustomEvent<ConsentStatus>).detail);
  window.addEventListener(EVENT, handler);
  return () => window.removeEventListener(EVENT, handler);
}
