import { Resend } from "resend";

// Server-only — diese Datei darf NIE in einer "use client"-Komponente
// importiert werden, sonst landet der API-Key im Browser-Code.
//
// Lazy init: der Resend-Konstruktor wirft synchron, wenn RESEND_API_KEY
// fehlt. Würde der Client hier beim Modulimport gebaut, crasht der
// gesamte Next.js-Build (Collecting page data), sobald der Key fehlt —
// auch wenn nie tatsächlich eine Mail verschickt wird. Der Proxy schiebt
// die Konstruktion auf den ersten echten Methodenzugriff (z.B.
// resend.emails.send()) hinaus.
let resendInstance: Resend | undefined;

function getResendInstance(): Resend {
  if (!resendInstance) {
    resendInstance = new Resend(process.env.RESEND_API_KEY);
  }
  return resendInstance;
}

export const resend: Resend = new Proxy({} as Resend, {
  get(_target, prop, _receiver) {
    const instance = getResendInstance();
    const value = Reflect.get(instance as object, prop, instance);
    return typeof value === "function" ? value.bind(instance) : value;
  },
});

// uvise.de ist bei Resend verifiziert (2026-07-10) — Versand an beliebige
// Empfänger funktioniert jetzt, nicht mehr nur an die eigene Resend-Adresse.
export const RESEND_FROM = "uVise <erinnerung@uvise.de>";
