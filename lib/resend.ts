import { Resend } from "resend";

// Server-only — diese Datei darf NIE in einer "use client"-Komponente
// importiert werden, sonst landet der API-Key im Browser-Code.
export const resend = new Resend(process.env.RESEND_API_KEY);

// uvise.de ist bei Resend verifiziert (2026-07-10) — Versand an beliebige
// Empfänger funktioniert jetzt, nicht mehr nur an die eigene Resend-Adresse.
export const RESEND_FROM = "uVise <erinnerung@uvise.de>";
