// [E1/E2] Laufzeit-Berechnung für das 12-Monats-Vertragsmodell: jeder Vertrag
// läuft ab contract_started_at in 12-Monats-Perioden, verlängert sich ohne
// Kündigung automatisch um weitere 12 Monate. Ordentliche Kündigung braucht
// NOTICE_MONTHS Vorlauf zum jeweiligen Laufzeitende -- kommt sie zu spät,
// wird sie erst zum übernächsten Laufzeitende wirksam (§314 BGB / fristlose
// Kündigung aus wichtigem Grund bleibt davon unberührt, läuft nicht über
// diesen Weg).
export const CONTRACT_TERM_MONTHS = 12;
export const NOTICE_MONTHS = 3;

// setMonth()/getMonth() rechnen in der LOKALEN Zeitzone des ausführenden
// Prozesses -- auf einem Server nicht in UTC hätte das denselben Vertrag
// je nach Serverstandort/-uhrzeit auf ein anderes Kündigungsdatum gerechnet.
// UTC-Varianten machen das Ergebnis unabhängig von der Serverzeitzone.
function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setUTCMonth(d.getUTCMonth() + months);
  return d;
}

// Das Ende der aktuell laufenden 12-Monats-Periode, relativ zu `now`.
export function contractTermEnd(startedAt: Date, now: Date = new Date()): Date {
  let termEnd = addMonths(startedAt, CONTRACT_TERM_MONTHS);
  while (termEnd <= now) {
    termEnd = addMonths(termEnd, CONTRACT_TERM_MONTHS);
  }
  return termEnd;
}

// Frühestmöglicher wirksamer Kündigungstermin, wenn JETZT (now) gekündigt wird.
export function earliestCancellationDate(startedAt: Date, now: Date = new Date()): Date {
  const termEnd = contractTermEnd(startedAt, now);
  const noticeDeadline = addMonths(termEnd, -NOTICE_MONTHS);
  if (now <= noticeDeadline) {
    return termEnd;
  }
  return addMonths(termEnd, CONTRACT_TERM_MONTHS);
}
