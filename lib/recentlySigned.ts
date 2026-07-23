import type { EmployeeTraining } from "@/lib/types";

// Zeitfenster, in dem ein frisch signierter Nachweis als "neu" markiert wird
// (roter Punkt im Archiv) -- es gibt keinen "gesehen/gedruckt"-Status in der
// Datenbank, daher als einfacher Näherungswert über das Signierdatum gelöst.
export const RECENT_SIGNED_DAYS = 7;

// signiertAm kommt als deutsches Datum "TT.MM.JJJJ" (toLocaleDateString) --
// von new Date() nicht zuverlässig parsbar, deshalb von Hand.
function parseGermanDate(value: string): number | null {
  const match = value.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (!match) return null;
  const [, day, month, yearStr] = match;
  const date = new Date(Number(yearStr), Number(month) - 1, Number(day));
  return Number.isNaN(date.getTime()) ? null : date.getTime();
}

export function isRecentlySigned(et: EmployeeTraining): boolean {
  if (et.status !== "signiert" || !et.signiertAm) return false;
  const signedAt = parseGermanDate(et.signiertAm);
  if (signedAt === null) return false;
  const days = (Date.now() - signedAt) / (24 * 60 * 60 * 1000);
  return days >= 0 && days <= RECENT_SIGNED_DAYS;
}

export function countRecentlySigned(employeeTrainings: EmployeeTraining[]): number {
  return employeeTrainings.filter(isRecentlySigned).length;
}
